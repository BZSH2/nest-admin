import { ApiExtension } from '@nestjs/swagger';

export const API_MODULE_EXTENSION = 'x-api-module';

/**
 * Define which service (module) this endpoint belongs to.
 * This adds an 'x-api-module' extension to the OpenAPI operation.
 * @param serviceName The name of the service/module (e.g., 'LoginModule', 'RoleModule')
 */
export const ApiModule = (serviceName: string) => ApiExtension(API_MODULE_EXTENSION, serviceName);
