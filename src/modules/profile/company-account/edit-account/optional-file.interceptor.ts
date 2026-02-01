import { FileInterceptor } from "@nestjs/platform-express"
import type { CallHandler, ExecutionContext, NestInterceptor, Type } from "@nestjs/common"
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"

export const OptionalFileInterceptor = (
  fieldName: string,
  localOptions?: MulterOptions,
): Type<NestInterceptor> => {
  const baseInterceptor = FileInterceptor(fieldName, localOptions)

  class Interceptor extends baseInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
      const request = context.switchToHttp().getRequest()
      if (!request?.is?.("multipart/form-data")) {
        return next.handle()
      }
      return super.intercept(context, next)
    }
  }

  return Interceptor
}
