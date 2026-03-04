import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-roomdetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roomdetails.html',
  styleUrl: './roomdetails.css'
})
export class RoomdetailsComponent implements OnInit {
  roomId!: number;
  room: any;
  loading = true;
  message = '';

  booking = {
    checkInDate: '',
    checkOutDate: '',
    guests: 1
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchRoomDetails();
  }

  fetchRoomDetails() {
    const token = localStorage.getItem('token');

    this.http.get(`http://localhost:8080/api/rooms/${this.roomId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).subscribe({
      next: (data) => {
        this.room = data;
        this.loading = false;
      },
      error: () => {
        this.message = 'Room not found!';
        this.loading = false;
      }
    });
  }

  bookRoom() {
    if (!this.auth.isLoggedIn()) {
      alert('Please login to continue booking.');
      this.router.navigate(['/login']);
      return;
    }

    // Match backend DTO: roomId + userEmail + dates + guests
    const bookingData = {
      roomId: this.roomId,
      userEmail: localStorage.getItem('email'),
      checkInDate: this.booking.checkInDate,
      checkOutDate: this.booking.checkOutDate,
      guests: this.booking.guests
    };

    this.http.post('http://localhost:8080/api/bookings', bookingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe({
      next: () => {
        this.message = 'Booking successful';
        this.resetForm();
      },
      error: (err) => {
        console.log(err);
        // For this UI, always show a clear duplicate-dates style message
        this.message = 'Room already booked for selected dates';
      }
    });
  }
  resetForm() {
    this.booking = {
      checkInDate: '',
      checkOutDate: '',
      guests: 1
    };
  }
}
