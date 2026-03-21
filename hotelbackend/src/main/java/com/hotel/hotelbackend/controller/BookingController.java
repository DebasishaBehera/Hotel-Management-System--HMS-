package com.hotel.hotelbackend.controller;

import com.hotel.hotelbackend.model.Booking;
import com.hotel.hotelbackend.model.Room;
import com.hotel.hotelbackend.repository.BookingRepository;
import com.hotel.hotelbackend.repository.RoomRepository;
import com.hotel.hotelbackend.dto.BookingRequest;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingController(BookingRepository bookingRepository,
                             RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    // ✅ GET ALL BOOKINGS (Admin Panel)
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ✅ GET BOOKING BY ID (Needed for Edit Page)
    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // ✅ CREATE BOOKING
    @PostMapping
    public Booking createBooking(@RequestBody BookingRequest request) {

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Room already booked for selected dates");
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUserEmail(request.getUserEmail());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests());

        return bookingRepository.save(booking);
    }


 // ✅ UPDATE BOOKING (Edit Booking with conflict check)
    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable Long id,
                                 @RequestBody BookingRequest request) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Room room = booking.getRoom();

        // if user changes room
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }

        // 🔴 CHECK CONFLICTS
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                room.getId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        // remove current booking from conflict list
        conflicts.removeIf(b -> b.getId().equals(id));

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Room already booked for selected dates");
        }

        booking.setRoom(room);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests());

        return bookingRepository.save(booking);
    }

    // ✅ DELETE BOOKING
    @DeleteMapping("/{id}")
    public void cancelBooking(@PathVariable Long id) {
        bookingRepository.deleteById(id);
    }
}