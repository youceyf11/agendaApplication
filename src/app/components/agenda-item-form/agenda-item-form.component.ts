import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgendaItem, ItemType, Priority } from '../../models/agenda-item.model';
import { Task } from '../../models/task.model';
import { Event } from '../../models/event.model';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-agenda-item-form',
    templateUrl: './agenda-item-form.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        NgFor
    ],
    styleUrls: ['./agenda-item-form.component.css']
})
export class AgendaItemFormComponent implements OnInit {
  @Input() item?: AgendaItem;
  @Input() selectedDate: Date = new Date();
  @Output() save = new EventEmitter<AgendaItem>();
  @Output() cancel = new EventEmitter<void>();
  
  form!: FormGroup;
  itemType = ItemType;
  priority = Priority;
  categories: Category[] = [];
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) { }
  
  ngOnInit(): void {
    this.createForm();
    this.loadCategories();
    
    // When type changes, update form validation and fields
    this.form.get('type')?.valueChanges.subscribe(type => {
      this.updateFormForType(type);
    });
  }
  
  private loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
  
  private createForm() {
    // Initialize with common fields
    this.form = this.fb.group({
      title: [this.item?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.item?.description || ''],
      type: [this.item?.type || ItemType.TASK],
      date: [this.formatDateForInput(this.item?.date || this.selectedDate), Validators.required],
      priority: [this.item?.priority || Priority.MEDIUM],
      reminder: [this.formatDateForInput(this.item?.reminder)],
      categoryId: [this.item?.categoryId || null],
      // Task specific
      deadline: [this.formatDateForInput((this.item as Task)?.deadline)],
      completed: [(this.item as Task)?.completed || false],
      // Event specific
      startTime: [this.formatTimeForInput((this.item as Event)?.startTime || new Date())],
      endTime: [this.formatTimeForInput((this.item as Event)?.endTime || new Date())],
      location: [(this.item as Event)?.location || '']
    });
    
    // Set initial form state based on item type
    this.updateFormForType(this.form.get('type')?.value);
  }
  
  private updateFormForType(type: ItemType) {
    if (type === ItemType.TASK) {
      this.form.get('deadline')?.enable();
      this.form.get('completed')?.enable();
      this.form.get('startTime')?.disable();
      this.form.get('endTime')?.disable();
      this.form.get('location')?.disable();
    } else {
      this.form.get('deadline')?.disable();
      this.form.get('completed')?.disable();
      this.form.get('startTime')?.enable();
      this.form.get('endTime')?.enable();
      this.form.get('location')?.enable();
    }
  }
  
  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    
    const formValue = this.form.value;
    let agendaItem: AgendaItem;
    
    // Convert form date strings to Date objects
    const date = new Date(formValue.date);
    const reminder = formValue.reminder ? new Date(formValue.reminder) : undefined;
    
    if (formValue.type === ItemType.TASK) {
      const deadline = formValue.deadline ? new Date(formValue.deadline) : undefined;
      
      agendaItem = new Task({
        ...(this.item ? { id: this.item.id } : {}),
        title: formValue.title,
        description: formValue.description,
        date,
        priority: formValue.priority,
        reminder,
        categoryId: formValue.categoryId,
        userId: this.item?.userId || 1,
        deadline,
        completed: formValue.completed
      });
    } else {
      // For an event, we need to combine the date with start and end times
      const startDateTime = this.combineDateTime(date, formValue.startTime);
      const endDateTime = this.combineDateTime(date, formValue.endTime);
      
      agendaItem = new Event({
        ...(this.item ? { id: this.item.id } : {}),
        title: formValue.title,
        description: formValue.description,
        date,
        priority: formValue.priority,
        reminder,
        categoryId: formValue.categoryId,
        userId: this.item?.userId || 1,
        startTime: startDateTime,
        endTime: endDateTime,
        location: formValue.location
      });
    }
    
    this.save.emit(agendaItem);
  }
  
  onCancel() {
    this.cancel.emit();
  }
  
  private formatDateForInput(date?: Date): string {
    if (!date) {
      return '';
    }
    
    // Format to YYYY-MM-DD for input[type="date"]
    return date.toISOString().split('T')[0];
  }
  
  private formatTimeForInput(date?: Date): string {
    if (!date) {
      return '';
    }
    
    // Format to HH:MM for input[type="time"]
    return date.toTimeString().substring(0, 5);
  }
  
  private combineDateTime(date: Date, timeString: string): Date {
    const result = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    
    result.setHours(hours);
    result.setMinutes(minutes);
    
    return result;
  }
}