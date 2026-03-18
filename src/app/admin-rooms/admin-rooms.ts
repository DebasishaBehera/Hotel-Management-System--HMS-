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
  searchTerm = '';
  selectedType = 'all';
  sortBy = 'recommended';

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

  get filteredRooms(): any[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    const filtered = this.rooms.filter((room) => {
      const roomName = this.getRoomName(room).toLowerCase();
      const roomType = this.getRoomType(room).toLowerCase();
      const roomDescription = this.getRoomDescription(room).toLowerCase();
      const matchesSearch = !normalizedSearch
        || roomName.includes(normalizedSearch)
        || roomType.includes(normalizedSearch)
        || roomDescription.includes(normalizedSearch);
      const matchesType = this.selectedType === 'all'
        || roomType === this.selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });

    return filtered.sort((first, second) => {
      if (this.sortBy === 'recommended') {
        return 0;
      }

      if (this.sortBy === 'price-high') {
        return this.getRoomPrice(second) - this.getRoomPrice(first);
      }

      if (this.sortBy === 'price-low') {
        return this.getRoomPrice(first) - this.getRoomPrice(second);
      }

      if (this.sortBy === 'capacity') {
        return this.getRoomCapacity(second) - this.getRoomCapacity(first);
      }

      return this.getRoomName(first).localeCompare(this.getRoomName(second));
    });
  }

  get roomTypes(): string[] {
    return Array.from(
      new Set(
        this.rooms
          .map((room) => this.getRoomType(room))
          .filter((type) => !!type)
      )
    );
  }

  get averagePrice(): number {
    if (!this.rooms.length) {
      return 0;
    }

    const total = this.rooms.reduce((sum, room) => sum + this.getRoomPrice(room), 0);
    return Math.round(total / this.rooms.length);
  }

  get maxCapacity(): number {
    return this.rooms.length
      ? Math.max(...this.rooms.map((room) => this.getRoomCapacity(room)))
      : 0;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.sortBy = 'recommended';
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

  getRoomName(room: any): string {
    return room.name || room.type || `Room #${room.room_number}`;
  }

  getRoomDescription(room: any): string {
    return room.description || `Room number ${room.room_number}`;
  }

  getRoomType(room: any): string {
    return room.type || 'Room';
  }

  getRoomPrice(room: any): number {
    return Number(room.pricePerNight || room.price || 0);
  }

  getRoomCapacity(room: any): number {
    return Number(room.capacity || 0);
  }
}
