import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbsTreeComponent } from './breadcrumbs-tree.component';

describe('BreadcrumbsTreeComponent', () => {
  let component: BreadcrumbsTreeComponent;
  let fixture: ComponentFixture<BreadcrumbsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreadcrumbsTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
