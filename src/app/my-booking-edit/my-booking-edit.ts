import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-my-booking-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-booking-edit.html',
  styleUrl: './my-booking-edit.css'
})
export class MyBookingEditComponent implements OnInit {
  form: any = {
    id: null,
    roomLabel: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1
  };

  loading = false;
  message = '';
  error = '';
  readonly today = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.auth.isAdmin()) {
      this.router.navigate(['/admin/bookings']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid booking id.';
      return;
    }

    this.loadBooking(id);
  }

  private get authHeaders(): Record<string, string | string[]> | undefined {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    return { Authorization: `Bearer ${token}` };
  }

  loadBooking(id: string): void {
    this.loading = true;
    this.error = '';

    this.http.get(`http://localhost:8080/api/bookings/${id}`, {
      headers: this.authHeaders
    }).subscribe({
      next: (data: any) => {
        if (this.getBookingEmail(data) !== this.auth.getUserEmail().toLowerCase()) {
          this.error = 'You can only edit your own bookings.';
          this.loading = false;
          return;
        }

        this.form.id = data.id;
        this.form.roomLabel = data.room?.name || data.roomName || (data.roomId ? `Room #${data.roomId}` : 'Room');
        this.form.checkInDate = (data.checkInDate || '').substring(0, 10);
        this.form.checkOutDate = (data.checkOutDate || '').substring(0, 10);
        this.form.guests = data.guests ?? 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'Failed to load booking.';
        this.loading = false;
      }
    });
  }

  updateBooking(): void {
    if (!this.form.id) {
      return;
    }

    this.message = '';
    this.error = '';

    if (this.stayNights <= 0) {
      this.error = 'Check-out date must be at least one day after check-in date.';
      return;
    }

    if (Number(this.form.guests) < 1) {
      this.error = 'Guests must be at least 1.';
      return;
    }

    const body = {
      checkInDate: this.form.checkInDate,
      checkOutDate: this.form.checkOutDate,
      guests: this.form.guests
    };

    this.http.put(`http://localhost:8080/api/bookings/${this.form.id}`, body, {
      headers: this.authHeaders
    }).subscribe({
      next: () => {
        this.router.navigate(['/my-bookings'], {
          state: { message: 'Booking updated successfully.' }
        });
      },
      error: (err) => {
        console.error(err);
        if (err?.status === 403) {
          this.error = 'Room already booked for selected dates.';
          return;
        }

        this.error = err?.error?.message || 'Failed to update booking.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-bookings']);
  }

  get minCheckOutDate(): string {
    if (!this.form.checkInDate) {
      return this.today;
    }

    return this.addDays(this.form.checkInDate, 1);
  }

  get stayNights(): number {
    if (!this.form.checkInDate || !this.form.checkOutDate) {
      return 0;
    }

    const checkIn = new Date(`${this.form.checkInDate}T00:00:00`);
    const checkOut = new Date(`${this.form.checkOutDate}T00:00:00`);
    const diff = checkOut.getTime() - checkIn.getTime();
    return diff > 0 ? Math.floor(diff / 86400000) : 0;
  }

  get canSubmitUpdate(): boolean {
    return !!this.form.checkInDate
      && !!this.form.checkOutDate
      && this.stayNights > 0
      && Number(this.form.guests) >= 1;
  }

  onCheckInDateChange(): void {
    if (this.form.checkOutDate && this.stayNights <= 0) {
      this.form.checkOutDate = '';
    }

    this.error = '';
  }

  onCheckOutDateChange(): void {
    this.error = '';
  }

  private getBookingEmail(booking: any): string {
    return String(booking.user?.email || booking.userEmail || booking.email || '').toLowerCase();
  }

  private addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return this.today;
    }

    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}