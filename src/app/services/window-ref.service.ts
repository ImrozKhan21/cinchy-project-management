import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

function _window(): any {
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
  }

  get nativeWindow(): any {
    return _window();
  }

  isSSR(): boolean {
    return !isPlatformBrowser(this.platformId);
  }

  openUrl(url: string, openSameTab = false) {
    const target = openSameTab ? '_self' : '_blank';
    if (isPlatformBrowser(this.platformId) && url) {
      this.nativeWindow.open(url, target);
    }
  }

  iniFrame() {
    if (isPlatformBrowser(this.platformId)) {
      return this.nativeWindow.location !== this.nativeWindow.parent.location;
    }
    return false;
  }
}
