import { TestBed } from '@angular/core/testing';

import { KanbanEditorService } from './kanban-editor.service';

describe('KanbanEditorService', () => {
  let service: KanbanEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KanbanEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
