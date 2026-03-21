package com.hotel.hotelbackend.repository;

import com.hotel.hotelbackend.model.Booking;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
    SELECT b FROM Booking b
    WHERE b.room.id = :roomId
    AND b.checkInDate < :checkOut
    AND b.checkOutDate > :checkIn
    """)
    List<Booking> findConflictingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut
    );
}