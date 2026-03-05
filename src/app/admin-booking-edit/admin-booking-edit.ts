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

  loading = false;
  message = '';
  error = '';

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
        this.error = 'Failed to update booking.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/bookings']);
  }
}
