import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeformatPipe } from './timeformat.pipe';

@NgModule({
  declarations: [TimeformatPipe],
  imports: [
    CommonModule
  ],
  exports: [TimeformatPipe]
})
export class PipesModule { }
