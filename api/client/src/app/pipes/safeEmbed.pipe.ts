import { PipeTransform, Pipe, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeEmbed' })
export class SafeEmbedPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}