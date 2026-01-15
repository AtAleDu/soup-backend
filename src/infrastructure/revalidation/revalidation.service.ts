import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name)

  async revalidate(path: string) {
    const url = `${process.env.FRONTEND_URL}/api/revalidate`

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
          path,
        }),
      })

      if (!res.ok) {
        this.logger.error(
          `Revalidate failed: ${res.status} ${await res.text()}`,
        )
        return
      }

      this.logger.log(`Revalidated path: ${path}`)
    } catch (error) {
      this.logger.error('Revalidate request error', error as Error)
    }
  }
}
