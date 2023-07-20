import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]',
  standalone: true

})
export class HorizontalScrollDirective {

  constructor(private element: ElementRef) { }

  @HostListener("wheel", ["$event"])
  public onScroll(event: WheelEvent) {
    this.element.nativeElement.scrollLeft += event.deltaY;
  }

}
