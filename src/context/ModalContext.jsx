import React, { useState } from 'react';
import { ModalContext } from './ModalContextValue.js';

export function ModalProvider({ children }) {
  const [donationModal, setDonationModal] = useState({ isOpen: false, programName: 'Program Kebaikan IYMPACK' });
  const [volunteerModal, setVolunteerModal] = useState(false);
  const [eventModal, setEventModal] = useState({ isOpen: false, eventTitle: 'Kegiatan IYMPACK' });
  const [searchModal, setSearchModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const openDonation = (programName = 'Program Kebaikan IYMPACK') => {
    setDonationModal({ isOpen: true, programName });
  };

  const closeDonation = () => {
    setDonationModal({ isOpen: false, programName: '' });
  };

  const openVolunteer = () => setVolunteerModal(true);
  const closeVolunteer = () => setVolunteerModal(false);

  const openEvent = (eventTitle = 'Kegiatan IYMPACK') => {
    setEventModal({ isOpen: true, eventTitle });
  };

  const closeEvent = () => setEventModal({ isOpen: false, eventTitle: '' });

  const openSearch = () => setSearchModal(true);
  const closeSearch = () => setSearchModal(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  return (
    <ModalContext.Provider
      value={{
        donationModal,
        openDonation,
        closeDonation,
        volunteerModal,
        openVolunteer,
        closeVolunteer,
        eventModal,
        openEvent,
        closeEvent,
        searchModal,
        openSearch,
        closeSearch,
        toast,
        showToast
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
