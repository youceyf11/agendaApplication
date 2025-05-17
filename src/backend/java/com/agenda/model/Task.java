package com.agenda.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("TASK")
public class Task extends AgendaItem {

    @Column
    private LocalDate deadline;

    @Column
    private boolean completed;

    public Task() {
        // Default constructor required by JPA
    }

    // Getters and Setters

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}