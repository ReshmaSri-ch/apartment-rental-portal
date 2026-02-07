import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/* ------------------ MODELS ------------------ */

export interface Flat {
  id: number;
  flatNo: string;
  floor: number;
  tower: string;
  rent: number;
  isAvailable: boolean;
  requestStatus?: 'Requested' | 'Approved' | 'Rejected' | null;
}

export interface Booking {
  id: number;
  user: string;
  flat: string;
  flatNo: string;
  floor: number;
  tower: string;
  status: 'Requested' | 'Approved' | 'Rejected';
}

/* ------------------ SERVICE ------------------ */

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /* ---------- COMMON HEADERS ---------- */
  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  /* ---------- FLATS ---------- */
  getFlatsByFloor(floor: number): Observable<Flat[]> {
    return this.http.get<Flat[]>(
      `${this.api}/flats/${floor}`,
      this.authHeaders()
    );
  }

  /* ---------- USER ---------- */
  createBooking(flatId: number) {
    return this.http.post(
      `${this.api}/bookings`,
      { flatId },
      this.authHeaders()
    );
  }
  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.api}/bookings`,
      this.authHeaders()
    );
  }

  /* ---------- ADMIN ---------- */
  getAdminBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.api}/admin/bookings`,
      this.authHeaders()
    );
  }

  approveBooking(id: number) {
    return this.http.post(
      `${this.api}/admin/bookings/${id}/approve`,
      {},
      this.authHeaders()
    );
  }

  rejectBooking(id: number) {
    return this.http.post(
      `${this.api}/admin/bookings/${id}/reject`,
      {},
      this.authHeaders()
    );
  }
}
