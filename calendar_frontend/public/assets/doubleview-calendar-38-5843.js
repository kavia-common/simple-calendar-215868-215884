/**
 * Double-view Calendar Component
 * Handles date range selection, preset date ranges, and calendar navigation
 */

// PUBLIC_INTERFACE
class DoubleViewCalendar {
    /**
     * Initialize the double-view calendar
     */
    constructor() {
        this.startDate = null;
        this.endDate = null;
        this.currentMonth1 = new Date(2021, 3, 1); // April 2021
        this.currentMonth2 = new Date(2021, 4, 1); // May 2021
        this.selectedPreset = 'last-7';
        
        this.init();
    }

    /**
     * Initialize event listeners and set up the calendar
     */
    init() {
        this.setupPresetButtons();
        this.setupNavigationButtons();
        this.setupDayClickHandlers();
        this.applyPreset('last-7');
    }

    /**
     * Setup preset button event listeners
     */
    setupPresetButtons() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.handlePresetClick(preset);
            });
        });
    }

    /**
     * Handle preset button click
     * @param {string} preset - The preset identifier
     */
    handlePresetClick(preset) {
        // Remove active class from all buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        const activeBtn = document.querySelector(`[data-preset="${preset}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.selectedPreset = preset;
        this.applyPreset(preset);
    }

    /**
     * Apply preset date range
     * @param {string} preset - The preset identifier
     */
    applyPreset(preset) {
        const today = new Date();
        let start, end;

        switch (preset) {
            case 'today':
                start = end = new Date(today);
                break;
            case 'last-7':
                end = new Date(2021, 3, 9); // April 9, 2021
                start = new Date(2021, 3, 2); // April 2, 2021
                break;
            case 'last-30':
                end = new Date(today);
                start = new Date(today);
                start.setDate(start.getDate() - 30);
                break;
            case 'last-90':
                end = new Date(today);
                start = new Date(today);
                start.setDate(start.getDate() - 90);
                break;
            case '2021':
                start = new Date(2021, 0, 1);
                end = new Date(2021, 11, 31);
                break;
            case '2020':
                start = new Date(2020, 0, 1);
                end = new Date(2020, 11, 31);
                break;
            case '2019':
                start = new Date(2019, 0, 1);
                end = new Date(2019, 11, 31);
                break;
            default:
                return;
        }

        this.startDate = start;
        this.endDate = end;
        this.updateCalendarDisplay();
    }

    /**
     * Setup navigation button event listeners
     */
    setupNavigationButtons() {
        const prevBtn = document.querySelector('.nav-btn.prev');
        const nextBtn = document.querySelector('.nav-btn.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }
    }

    /**
     * Navigate to previous month
     */
    navigatePrevious() {
        this.currentMonth1.setMonth(this.currentMonth1.getMonth() - 1);
        this.currentMonth2.setMonth(this.currentMonth2.getMonth() - 1);
        this.updateMonthYearDisplay();
    }

    /**
     * Navigate to next month
     */
    navigateNext() {
        this.currentMonth1.setMonth(this.currentMonth1.getMonth() + 1);
        this.currentMonth2.setMonth(this.currentMonth2.getMonth() + 1);
        this.updateMonthYearDisplay();
    }

    /**
     * Update month and year display in headers
     */
    updateMonthYearDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const calendars = document.querySelectorAll('.calendar');
        
        if (calendars[0]) {
            const month1Span = calendars[0].querySelector('.month-selector span');
            const year1Span = calendars[0].querySelector('.year-selector span');
            if (month1Span) month1Span.textContent = monthNames[this.currentMonth1.getMonth()];
            if (year1Span) year1Span.textContent = this.currentMonth1.getFullYear();
        }

        if (calendars[1]) {
            const month2Span = calendars[1].querySelector('.month-selector span');
            const year2Span = calendars[1].querySelector('.year-selector span');
            if (month2Span) month2Span.textContent = monthNames[this.currentMonth2.getMonth()];
            if (year2Span) year2Span.textContent = this.currentMonth2.getFullYear();
        }
    }

    /**
     * Setup day click handlers for date selection
     */
    setupDayClickHandlers() {
        const days = document.querySelectorAll('.day:not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                this.handleDayClick(e.target);
            });
        });
    }

    /**
     * Handle day cell click
     * @param {HTMLElement} dayElement - The clicked day element
     */
    handleDayClick(dayElement) {
        if (dayElement.classList.contains('disabled')) {
            return;
        }

        const dayNumber = parseInt(dayElement.textContent);
        
        // Determine which calendar the day belongs to
        const calendar = dayElement.closest('.calendar');
        const calendarIndex = Array.from(document.querySelectorAll('.calendar')).indexOf(calendar);
        
        const selectedDate = new Date(
            calendarIndex === 0 ? this.currentMonth1.getFullYear() : this.currentMonth2.getFullYear(),
            calendarIndex === 0 ? this.currentMonth1.getMonth() : this.currentMonth2.getMonth(),
            dayNumber
        );

        // If no start date or both dates are set, set as new start date
        if (!this.startDate || (this.startDate && this.endDate)) {
            this.startDate = selectedDate;
            this.endDate = null;
        } else if (selectedDate < this.startDate) {
            // If selected date is before start date, make it the new start date
            this.endDate = this.startDate;
            this.startDate = selectedDate;
        } else {
            // Otherwise, set as end date
            this.endDate = selectedDate;
        }

        // Clear preset selection when manually selecting dates
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        this.updateCalendarDisplay();
        this.onDateRangeChange();
    }

    /**
     * Update calendar display to show selected date range
     */
    updateCalendarDisplay() {
        const days = document.querySelectorAll('.day:not(.disabled)');
        
        days.forEach(day => {
            day.classList.remove('selected', 'start', 'end', 'in-range');
            
            const dayNumber = parseInt(day.textContent);
            const calendar = day.closest('.calendar');
            const calendarIndex = Array.from(document.querySelectorAll('.calendar')).indexOf(calendar);
            
            const dayDate = new Date(
                calendarIndex === 0 ? this.currentMonth1.getFullYear() : this.currentMonth2.getFullYear(),
                calendarIndex === 0 ? this.currentMonth1.getMonth() : this.currentMonth2.getMonth(),
                dayNumber
            );

            if (this.startDate && this.endDate) {
                if (this.isSameDay(dayDate, this.startDate)) {
                    day.classList.add('selected', 'start');
                } else if (this.isSameDay(dayDate, this.endDate)) {
                    day.classList.add('selected', 'end');
                } else if (dayDate > this.startDate && dayDate < this.endDate) {
                    day.classList.add('selected', 'in-range');
                }
            } else if (this.startDate && this.isSameDay(dayDate, this.startDate)) {
                day.classList.add('selected', 'start');
            }
        });
    }

    /**
     * Check if two dates are the same day
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {boolean} True if dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * Callback for when date range changes
     * Override this method to handle date range changes
     */
    onDateRangeChange() {
        console.log('Date range selected:', {
            start: this.startDate,
            end: this.endDate,
            preset: this.selectedPreset
        });

        // Dispatch custom event for external listeners
        const event = new CustomEvent('dateRangeChange', {
            detail: {
                startDate: this.startDate,
                endDate: this.endDate,
                preset: this.selectedPreset
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get the currently selected date range
     * @returns {Object} Object containing start and end dates
     */
    getDateRange() {
        return {
            startDate: this.startDate,
            endDate: this.endDate
        };
    }

    /**
     * Set a specific date range programmatically
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     */
    setDateRange(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.updateCalendarDisplay();
        this.onDateRangeChange();
    }
}

// Initialize the calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.doubleViewCalendar = new DoubleViewCalendar();
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoubleViewCalendar;
}
