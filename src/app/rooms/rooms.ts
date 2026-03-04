import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Room } from '../models/room';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  error = '';

  checkInDate = '';
  checkOutDate = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms() {
    const token = localStorage.getItem('token');

    this.http.get('http://localhost:8080/api/rooms', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).subscribe({
      next: (data: any) => {
        console.log('Rooms from API:', data);
        this.rooms = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Unable to load rooms. Please try again later.';
        this.loading = false;
      }
    });
  }

  findRooms() {
    if (!this.checkInDate || !this.checkOutDate) {
      this.error = 'Please select both check-in and check-out dates.';
      return;
    }

    this.loading = true;
    this.error = '';

    const url = `http://localhost:8080/api/rooms/available?checkIn=${this.checkInDate}&checkOut=${this.checkOutDate}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Unable to find available rooms. Please try again later.';
        this.loading = false;
      }
    });
  }

  clearFilter() {
    this.checkInDate = '';
    this.checkOutDate = '';
    this.error = '';
    this.loading = true;
    this.fetchRooms();
  }
}
