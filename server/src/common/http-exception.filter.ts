import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const raw = typeof body === 'string' ? body : (body as any).message || (body as any).error || 'Có lỗi xảy ra.';
      const error = Array.isArray(raw) ? raw.join(' ') : raw;
      return res.status(status).json({ error });
    }
    const code = (exception as any)?.code;
    if (code === 'LIMIT_FILE_SIZE') {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'File quá lớn.' });
    }
    const message = exception instanceof Error ? exception.message : 'Lỗi máy chủ.';
    if (/không được hỗ trợ/i.test(message) || /Chưa chọn file/i.test(message)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    }
    console.error(exception);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi máy chủ.' });
  }
}
