import { FileInterceptor } from "@nestjs/platform-express"
import { BadRequestException } from "@nestjs/common"
import type { CallHandler, ExecutionContext, NestInterceptor, Type } from "@nestjs/common"
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import { catchError } from "rxjs/operators"
import { throwError } from "rxjs"

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
      const mapMulterError = (error: unknown) => {
        const code =
          typeof error === "object" && error !== null && "code" in error
            ? String((error as { code?: unknown }).code ?? "")
            : ""
        if (code === "LIMIT_FILE_SIZE") {
          return throwError(
            () => new BadRequestException("Слишком большой файл. Максимум 2 МБ."),
          )
        }
        return throwError(() => error)
      }

      const stream = super.intercept(context, next)
      if (stream instanceof Promise) {
        return stream.then((observable) =>
          observable.pipe(catchError(mapMulterError)),
        )
      }

      return stream.pipe(catchError(mapMulterError))
    }
  }

  return Interceptor
}
