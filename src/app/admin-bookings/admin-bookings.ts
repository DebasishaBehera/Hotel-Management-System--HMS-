import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-bookings.html',
  styleUrl: '../admin/admin.css'
})
export class AdminBookingsComponent implements OnInit {
  bookings: any[] = [];
  loadingBookings = false;
  message = '';
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn() || !this.auth.isAdmin()) {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadBookings();
  }

  loadBookings() {
    this.loadingBookings = true;
    this.http.get('http://localhost:8080/api/bookings', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.loadingBookings = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'Failed to load bookings.';
        this.loadingBookings = false;
      }
    });
  }

  editBooking(bookingId: number) {
    this.router.navigate(['/admin/bookings', bookingId, 'edit']);
  }

  deleteBooking(bookingId: number) {
    if (!confirm('Cancel this booking?')) {
      return;
    }

    const token = localStorage.getItem('token');

    this.message = '';
    this.error = '';

    this.http.delete(`http://localhost:8080/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.message = 'Booking cancelled successfully.';
        this.loadBookings();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to cancel booking.';
      }
    });
  }
}
