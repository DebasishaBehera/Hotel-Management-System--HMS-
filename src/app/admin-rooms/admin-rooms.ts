import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-rooms.html',
  styleUrl: '../admin/admin.css'
})
export class AdminRoomsComponent implements OnInit {
  rooms: any[] = [];
  loadingRooms = false;
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

    this.loadRooms();
  }

  private get authHeaders(): Record<string, string | string[]> | undefined {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }
    return { Authorization: `Bearer ${token}` };
  }

  loadRooms() {
    this.loadingRooms = true;
    this.http.get('http://localhost:8080/api/rooms', {
      headers: this.authHeaders
    }).subscribe({
      next: (data: any) => {
        this.rooms = data;
        this.loadingRooms = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load rooms.';
        this.loadingRooms = false;
      }
    });
  }

  deleteRoom(roomId: number) {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    this.message = '';
    this.error = '';

    this.http.delete(`http://localhost:8080/api/rooms/${roomId}`, {
      headers: this.authHeaders
    }).subscribe({
      next: () => {
        this.message = 'Room deleted successfully.';
        this.loadRooms();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to delete room.';
      }
    });
  }
}
