import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';

const { Camera } = Plugins

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() { }

  public async takeNew() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90
    });
    return capturedPhoto.dataUrl;
  }
}
