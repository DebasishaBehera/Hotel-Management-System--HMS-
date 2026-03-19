import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin-booking-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-booking-edit.html',
  styleUrl: './admin-booking-edit.css'
})
export class AdminBookingEditComponent implements OnInit {
  form: any = {
    id: null,
    roomLabel: '',
    userLabel: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1
  };

  // Maximum guests allowed for this room (from backend)
  roomCapacity: number | null = null;

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
    if (!this.auth.isLoggedIn() || !this.auth.isAdmin()) {
      this.router.navigate(['/admin-login']);
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

  loadBooking(id: string) {
    this.loading = true;
    this.http.get(`http://localhost:8080/api/bookings/${id}`, {
      headers: this.authHeaders
    }).subscribe({
      next: (data: any) => {
        this.form.id = data.id;

        const roomName = data.room?.name || data.roomName || (data.roomId ? `Room #${data.roomId}` : 'Room');
        const userName = data.user?.name || data.customerName || data.userEmail || data.email || 'Guest';

        this.form.roomLabel = roomName;
        this.form.userLabel = userName;

        // assume ISO date strings from backend
        this.form.checkInDate = (data.checkInDate || '').substring(0, 10);
        this.form.checkOutDate = (data.checkOutDate || '').substring(0, 10);
        this.form.guests = data.guests ?? 1;

        const capacity = Number(
          data.room?.capacity ??
          (data.roomCapacity as number | undefined) ??
          (data.capacity as number | undefined) ??
          NaN
        );
        this.roomCapacity = Number.isFinite(capacity) && capacity > 0 ? capacity : null;

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load booking.';
        this.loading = false;
      }
    });
  }

  updateBooking() {
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

    if (this.roomCapacity !== null && Number(this.form.guests) > this.roomCapacity) {
      this.error = `Guests cannot exceed room capacity (max ${this.roomCapacity}).`;
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
        this.message = 'Booking updated successfully.';
        this.goBack();
      },
      error: (err) => {
        console.error(err);
        if (err?.status === 403) {
          this.error = 'Room already booked for selected dates.';
          return;
        }
        this.error = 'Failed to update booking.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/bookings']);
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
      && Number(this.form.guests) >= 1
      && (this.roomCapacity === null || Number(this.form.guests) <= this.roomCapacity);
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

  private addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return this.today;
    }

    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
