import { Injectable, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { OpenAPIObject } from '@nestjs/swagger';
import { API_MODULE_EXTENSION } from '../common/decorators/api-module.decorator';
import type { PostOpenApiDto } from './dto/post-openapi.dto';

export interface OpenApiServiceDefinition {
  label: string;
  value: string; // The service name (e.g., 'LoginModule')
}

export interface OpenApiModuleDefinition {
  prefix: string;
  label?: string;
  service: OpenApiServiceDefinition[];
}

@Injectable()
export class OpenApiService {
  private readonly logger = new Logger(OpenApiService.name);
  private static document: OpenAPIObject;

  constructor(private readonly configService: ConfigService) {}

  static setDocument(doc: OpenAPIObject) {
    OpenApiService.document = doc;
  }

  getModules() {
    if (!OpenApiService.document) {
      this.logger.warn('OpenAPI 文档未设置');
      return [];
    }

    const paths = OpenApiService.document.paths || {};
    // Map<Prefix, Map<ServiceName, ServiceLabel>>
    // ServiceName 是 'x-api-module' 的值
    const modulesMap = new Map<string, { label?: string; services: Set<string> }>();

    for (const pathItem of Object.values(paths)) {
      if (!pathItem) continue;

      // 遍历标准的 HTTP 方法
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

      for (const method of methods) {
        const operation = (pathItem as any)[method];
        if (!operation) continue;

        const tags = operation.tags || [];
        const moduleName = operation[API_MODULE_EXTENSION];

        // 仅处理带有 @ApiModule 元数据的操作
        if (moduleName) {
          // 按标签 (Prefix) 分组
          for (const tag of tags) {
            if (!modulesMap.has(tag)) {
              modulesMap.set(tag, { services: new Set() });
            }
            modulesMap.get(tag)?.services.add(moduleName);
          }
        }
      }
    }

    // 尝试从 Swagger tags 定义中丰富 Prefix 的描述
    if (OpenApiService.document.tags) {
      for (const tagDef of OpenApiService.document.tags) {
        const moduleInfo = modulesMap.get(tagDef.name);
        if (moduleInfo) {
          moduleInfo.label = tagDef.description;
        }
      }
    }

    // 将 Map 转换为数组用于响应
    const result: OpenApiModuleDefinition[] = [];
    for (const [prefix, data] of modulesMap.entries()) {
      const services: OpenApiServiceDefinition[] = [];
      for (const moduleName of data.services) {
        services.push({ value: moduleName, label: moduleName });
      }

      result.push({
        prefix,
        label: data.label || prefix,
        service: services,
      });
    }

    return result;
  }

  getOpenApiJson(dto: PostOpenApiDto) {
    if (!OpenApiService.document) {
      this.logger.warn('OpenAPI 文档未设置');
      return [];
    }

    const { modules } = dto;
    if (!modules || modules.length === 0) {
      return [];
    }

    const port = this.configService.get<number>('PORT') || 3000;
    const host = process.env.HOST || 'localhost';
    const protocol = process.env.PROTOCOL || 'http';
    const baseUrl = `${protocol}://${host}:${port}`;

    const result: OpenAPIObject[] = [];

    for (const mod of modules) {
      const { prefix: targetPrefix, service: targetModules } = mod;

      for (const targetModuleName of targetModules) {
        const newPaths: any = {};
        const sourcePaths = OpenApiService.document.paths || {};

        for (const [path, pathItem] of Object.entries(sourcePaths)) {
          if (!pathItem) continue;

          const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
          let hasMatch = false;
          const newPathItem: any = {};

          for (const method of methods) {
            const operation = (pathItem as any)[method];
            if (!operation) continue;

            const tags = operation.tags || [];
            const moduleName = operation[API_MODULE_EXTENSION];

            // 检查操作是否属于目标模块
            // 逻辑：tags 必须包含 targetPrefix 且 x-api-module 必须匹配 targetModuleName
            if (tags.includes(targetPrefix) && moduleName === targetModuleName) {
              newPathItem[method] = operation;
              hasMatch = true;
            }
          }

          if (hasMatch) {
            if ((pathItem as any).parameters) {
              newPathItem.parameters = (pathItem as any).parameters;
            }
            newPaths[path] = newPathItem;
          }
        }

        const filteredComponents = this.filterComponents(
          newPaths,
          OpenApiService.document.components,
        );

        const newDoc: OpenAPIObject = {
          ...OpenApiService.document,
          info: {
            ...OpenApiService.document.info,
            title: targetModuleName, // 使用模块名作为标题
          },
          servers: [{ url: baseUrl }],
          paths: newPaths,
          components: filteredComponents,
        };

        result.push(newDoc);
      }
    }

    return result;
  }

  getSingleOpenApiJson() {
    return this.getOpenApiJson({
      modules: [
        {
          prefix: 'OpenAPI',
          service: ['OpenAPIModule'],
        },
      ],
    });
  }

  private filterComponents(paths: any, sourceComponents: any) {
    if (!sourceComponents) return undefined;

    const usedSchemas = new Set<string>();
    const usedSecuritySchemes = new Set<string>();

    // Helper to extract refs from object
    const extractRefs = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.$ref) {
        const ref = obj.$ref as string;
        if (ref.startsWith('#/components/schemas/')) {
          const schemaName = ref.replace('#/components/schemas/', '');
          if (!usedSchemas.has(schemaName)) {
            usedSchemas.add(schemaName);
            // Recursively check referenced schema
            if (sourceComponents.schemas?.[schemaName]) {
              extractRefs(sourceComponents.schemas[schemaName]);
            }
          }
        }
        if (ref.startsWith('#/components/securitySchemes/')) {
          const schemeName = ref.replace('#/components/securitySchemes/', '');
          usedSecuritySchemes.add(schemeName);
        }
      }

      for (const key in obj) {
        extractRefs(obj[key]);
      }
    };

    // Scan paths for refs
    extractRefs(paths);

    // Also include security schemes if security is defined in paths
    // (Wait, security is usually defined at root or operation level)
    // We already scanned paths, so if security references a scheme, it might not be a $ref.
    // Security requirements are like: security: [{ "bearer": [] }]
    // We need to scan for security keys.

    const scanSecurity = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.security && Array.isArray(obj.security)) {
        for (const sec of obj.security) {
          for (const key in sec) {
            usedSecuritySchemes.add(key);
          }
        }
      }
      for (const key in obj) {
        scanSecurity(obj[key]);
      }
    };
    scanSecurity(paths);

    // Build filtered components
    const newComponents: any = {};

    if (sourceComponents.schemas && usedSchemas.size > 0) {
      newComponents.schemas = {};
      for (const schemaName of usedSchemas) {
        newComponents.schemas[schemaName] = sourceComponents.schemas[schemaName];
      }
    }

    if (sourceComponents.securitySchemes && usedSecuritySchemes.size > 0) {
      newComponents.securitySchemes = {};
      for (const schemeName of usedSecuritySchemes) {
        newComponents.securitySchemes[schemeName] = sourceComponents.securitySchemes[schemeName];
      }
    }

    // Can add other component types (responses, parameters, etc.) if needed.
    // For now, schemas and securitySchemes are the most important.

    return newComponents;
  }
}
