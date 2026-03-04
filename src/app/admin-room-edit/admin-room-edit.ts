import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin-room-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-room-edit.html',
  styleUrl: './admin-room-edit.css'
})
export class AdminRoomEditComponent implements OnInit {
  form: any = {
    id: null,
    name: '',
    description: '',
    pricePerNight: 0,
    capacity: 1,
    imageUrl: '',
    type: 'SINGLE'
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
      this.error = 'Invalid room id.';
      return;
    }

    this.loadRoom(id);
  }

  private get authHeaders(): Record<string, string | string[]> | undefined {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }
    return { Authorization: `Bearer ${token}` };
  }

  loadRoom(id: string) {
    this.loading = true;
    this.http.get(`http://localhost:8080/api/rooms/${id}`, {
      headers: this.authHeaders
    }).subscribe({
      next: (data: any) => {
        this.form = {
          id: data.id,
          name: data.name,
          description: data.description,
          pricePerNight: data.pricePerNight,
          capacity: data.capacity,
          imageUrl: data.imageUrl,
          type: data.type || 'SINGLE'
        };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load room.';
        this.loading = false;
      }
    });
  }

  updateRoom() {
    if (!this.form.id) {
      return;
    }

    this.message = '';
    this.error = '';

    const body = {
      name: this.form.name,
      description: this.form.description,
      pricePerNight: this.form.pricePerNight,
      capacity: this.form.capacity,
      imageUrl: this.form.imageUrl,
      type: this.form.type
    };

    this.http.put(`http://localhost:8080/api/rooms/${this.form.id}`, body, {
      headers: this.authHeaders
    }).subscribe({
      next: () => {
        this.message = 'Room updated successfully.';
        this.goBack();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to update room.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
