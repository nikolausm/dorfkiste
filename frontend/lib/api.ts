const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5124/api';

// Booking related interfaces
export interface BookingAvailability {
  isAvailable: boolean;
  availableDates: string[];
  unavailableDates: string[];
  pricePerDay: number;
  errorMessage?: string;
}

export interface BookingRequest {
  startDate: string;
  endDate: string;
  termsAccepted: boolean;
  withdrawalRightAcknowledged: boolean;
}

export interface BookingResponse {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  daysCount: number;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  offer: {
    id: number;
    title: string;
    description: string;
    isService: boolean;
    pricePerDay?: number;
    pricePerHour?: number;
    isActive: boolean;
    provider: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    firstPicture?: {
      id: number;
      fileName: string;
      contentType: string;
      displayOrder: number;
    };
  };
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PriceCalculation {
  totalPrice: number;
  pricePerDay: number;
  daysCount: number;
  startDate: string;
  endDate: string;
}

export interface BookedDatesResponse {
  offerId: number;
  bookedDates: string[];
}

// Rental Contract interfaces
export interface RentalContract {
  id: number;
  bookingId: number;
  lessorId: number;
  lesseeId: number;
  lessorName: string;
  lesseeName: string;
  lessorEmail: string;
  lesseeEmail: string;
  offerTitle: string;
  offerDescription: string;
  offerType: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  totalPrice: number;
  depositAmount: number;
  pricePerDay: number;
  termsAndConditions: string;
  specialConditions: string;
  createdAt: string;
  signedByLessorAt?: string;
  signedByLesseeAt?: string;
  status: string;
  lastModifiedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface GenerateContractRequest {
  bookingId: number;
}

export interface CancelContractRequest {
  reason?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  iconName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
}

export interface ContactInfo {
  phoneNumber?: string;
  mobileNumber?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
}

export interface UserDetail {
  id: number;
  firstName: string;
  lastName: string;
  contactInfo?: ContactInfo;
}

export interface PrivacySettings {
  marketingEmailsConsent: boolean;
  dataProcessingConsent: boolean;
  profileVisibilityConsent: boolean;
  dataSharingConsent: boolean;
  showPhoneNumber: boolean;
  showMobileNumber: boolean;
  showStreet: boolean;
  showCity: boolean;
}

export interface UpdatePrivacySettingsRequest {
  marketingEmailsConsent?: boolean;
  dataProcessingConsent?: boolean;
  profileVisibilityConsent?: boolean;
  dataSharingConsent?: boolean;
  showPhoneNumber?: boolean;
  showMobileNumber?: boolean;
  showStreet?: boolean;
  showCity?: boolean;
}

export interface OfferPicture {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  displayOrder: number;
  createdAt: string;
}

export interface Offer {
  id: number;
  slug: string;
  title: string;
  description: string;
  pricePerDay?: number;
  pricePerHour?: number;
  salePrice?: number;
  isService: boolean;
  isForSale: boolean;
  deliveryAvailable: boolean;
  deliveryCost?: number;
  deposit?: number;
  imagePath?: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  user?: User;
  firstPicture?: OfferPicture;
}

export interface OfferDetail extends Omit<Offer, 'user'> {
  user?: UserDetail;
  pictures: OfferPicture[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Message {
  id: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  senderId: number;
  recipientId: number;
  offerId: number | null;
  sender?: User;
  recipient?: User;
  offer?: {
    id: number;
    title: string;
    firstPictureId?: number;
    isActive: boolean;
    isService: boolean;
  };
}

export interface SendMessageRequest {
  recipientId: number;
  offerId: number | null;
  content: string;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  contactInfo?: {
    phoneNumber?: string;
    mobileNumber?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    state?: string;
    country?: string;
  };
  privacySettings?: {
    marketingEmailsConsent: boolean;
    dataProcessingConsent: boolean;
    profileVisibilityConsent: boolean;
    dataSharingConsent: boolean;
    showPhoneNumber: boolean;
    showMobileNumber: boolean;
    showStreet: boolean;
    showCity: boolean;
    marketingEmailsConsentDate?: string;
    dataProcessingConsentDate?: string;
    profileVisibilityConsentDate?: string;
    dataSharingConsentDate?: string;
  };
}

export interface ReportType {
  IllegalContent: 0;
  Copyright: 1;
  Spam: 2;
  Fraud: 3;
  Harassment: 4;
  FakeProfile: 5;
  Other: 6;
}

export interface AdminReport {
  id: number;
  reportType: string;
  description: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  resolutionNotes?: string;
  reporter: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  reportedOffer?: {
    id: number;
    title: string;
    isActive: boolean;
  };
  reviewedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AnalyzeImageResponse {
  title: string;
  description: string;
  isService: boolean;
  suggestedCategoryName: string;
  suggestedCategoryId?: number;
  suggestedPricePerDay?: number;
  suggestedPricePerHour?: number;
  suggestedSalePrice?: number;
  suggestedDeliveryAvailable?: boolean;
  suggestedDeliveryCost?: number;
  suggestedDeposit?: number;
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Build headers, but don't set Content-Type for FormData
    const baseHeaders = {
      ...this.getAuthHeader(),
      ...options.headers,
    };

    // Only add Content-Type if it's not a FormData request
    const headers = options.body instanceof FormData
      ? baseHeaders
      : { 'Content-Type': 'application/json', ...baseHeaders };

    console.log('🚀 API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Disable SSL verification for development
        ...(process.env.NODE_ENV === 'development' && {
          // Note: This is handled by NODE_TLS_REJECT_UNAUTHORIZED=0 in development
        })
      });

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });

      if (!response.ok) {
        let errorData;
        let errorText = '';

        try {
          // First try to get the response as text
          errorText = await response.text();
          console.error('❌ Raw error response:', errorText);

          // Try to parse as JSON
          if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
            errorData = JSON.parse(errorText);
            console.error('❌ Parsed error data:', errorData);
          } else {
            // Not JSON, treat as plain text error
            errorData = {
              message: errorText || `HTTP ${response.status}: ${response.statusText}`
            };
            console.error('❌ Non-JSON error response:', errorData.message);
          }
        } catch (e) {
          console.error('❌ Failed to parse error response:', e);
          errorData = {
            message: errorText || `Network error - HTTP ${response.status}`
          };
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle responses with no content (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log('✅ Empty response (204)');
        return null as T;
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log('✅ JSON response:', result);
        return result;
      }

      // For non-JSON responses or empty responses
      const text = await response.text();
      const result = text ? JSON.parse(text) : null as T;
      console.log('✅ Text response:', result);
      return result;
    } catch (error) {
      console.error('💥 API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // User Privacy Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    return this.request('/user/privacy-settings');
  }

  async updatePrivacySettings(settings: UpdatePrivacySettingsRequest): Promise<PrivacySettings> {
    return this.request('/user/privacy-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Categories endpoints
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  async getCategory(id: number): Promise<Category> {
    return this.request(`/categories/${id}`);
  }

  // Offers endpoints
  async getOffers(categoryId?: number, search?: string): Promise<Offer[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    return this.request(`/offers${queryString ? `?${queryString}` : ''}`);
  }

  async getOffer(id: number): Promise<OfferDetail> {
    return this.request(`/offers/${id}`);
  }

  async createOffer(data: {
    title: string;
    description: string;
    pricePerDay?: number;
    pricePerHour?: number;
    salePrice?: number;
    isService: boolean;
    isForSale: boolean;
    deliveryAvailable: boolean;
    deliveryCost?: number;
    deposit?: number;
    categoryId: number;
  }): Promise<Offer> {
    return this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOffer(id: number, data: {
    title: string;
    description: string;
    pricePerDay?: number;
    pricePerHour?: number;
    salePrice?: number;
    isService: boolean;
    isForSale: boolean;
    deliveryAvailable: boolean;
    deliveryCost?: number;
    deposit?: number;
    categoryId: number;
    isActive: boolean;
  }): Promise<Offer> {
    return this.request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleOfferActive(id: number): Promise<Offer> {
    return this.request(`/offers/${id}/toggle-active`, {
      method: 'PATCH',
    });
  }

  async deleteOffer(id: number): Promise<void> {
    await this.request(`/offers/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyOffers(): Promise<Offer[]> {
    return this.request('/offers/my-offers');
  }

  // Picture endpoints
  async uploadPicture(offerId: number, file: File): Promise<OfferPicture> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/offers/${offerId}/pictures`, {
      method: 'POST',
      body: formData,
    });
  }

  async deletePicture(offerId: number, pictureId: number): Promise<void> {
    await this.request(`/offers/${offerId}/pictures/${pictureId}`, {
      method: 'DELETE',
    });
  }

  async updatePictureOrder(offerId: number, pictureId: number, displayOrder: number): Promise<void> {
    await this.request(`/offers/${offerId}/pictures/${pictureId}/order`, {
      method: 'PUT',
      body: JSON.stringify({ DisplayOrder: displayOrder }),
    });
  }

  getPictureUrl(pictureId: number): string {
    return `${API_BASE_URL}/offers/pictures/${pictureId}`;
  }

  async generateDescriptionFromPicture(offerId: number): Promise<{ description: string }> {
    return this.request(`/offers/${offerId}/generate-description-from-picture`, {
      method: 'POST',
    });
  }

  async testAnalyzeImage(file: File): Promise<AnalyzeImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/offers/test-analyze', {
      method: 'POST',
      body: formData,
    });
  }

  async analyzeImage(file: File, mode: 'rent' | 'sale' = 'rent'): Promise<AnalyzeImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    return this.request('/offers/analyze-image', {
      method: 'POST',
      body: formData,
    });
  }

  // Users endpoints
  async getProfile(): Promise<any> {
    return this.request('/users/profile');
  }

  async updateProfile(data: any): Promise<any> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserById(userId: number): Promise<PublicUser> {
    return this.request(`/users/${userId}`);
  }

  // Messages endpoints
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(recipientId: number, offerId: number): Promise<Message[]> {
    return this.request(`/messages/conversation/${recipientId}/offer/${offerId}`);
  }

  async getInbox(): Promise<Message[]> {
    return this.request('/messages/inbox');
  }

  async getSentMessages(): Promise<Message[]> {
    return this.request('/messages/sent');
  }

  async markMessageAsRead(messageId: number): Promise<Message> {
    return this.request(`/messages/${messageId}/mark-read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.request('/messages/unread-count');
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async deleteConversation(recipientId: number, offerId: number): Promise<void> {
    await this.request(`/messages/conversation/${recipientId}/offer/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Booking endpoints
  async checkAvailability(offerId: number, startDate: string, endDate: string): Promise<BookingAvailability> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return this.request(`/bookings/availability/${offerId}?${params.toString()}`);
  }

  async createBooking(offerId: number, data: BookingRequest): Promise<BookingResponse> {
    // Transform camelCase to PascalCase for backend compatibility
    const requestData = {
      StartDate: data.startDate,
      EndDate: data.endDate,
      TermsAccepted: data.termsAccepted,
      WithdrawalRightAcknowledged: data.withdrawalRightAcknowledged
    };

    return this.request(`/bookings/offers/${offerId}`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getMyBookings(): Promise<BookingResponse[]> {
    return this.request('/bookings/my-bookings');
  }

  async getMyServiceBookings(): Promise<BookingResponse[]> {
    return this.request('/bookings/my-services');
  }

  async getBooking(bookingId: number): Promise<BookingResponse> {
    return this.request(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId: number, reason?: string): Promise<BookingResponse> {
    const requestData = {
      Reason: reason
    };

    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }



  async calculatePrice(offerId: number, startDate: string, endDate: string): Promise<PriceCalculation> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return this.request(`/bookings/price/${offerId}?${params.toString()}`);
  }

  async getBookedDates(offerId: number): Promise<BookedDatesResponse> {
    return this.request(`/bookings/offers/${offerId}/booked-dates`);
  }

  async blockDates(offerId: number, startDate: string, endDate: string, reason?: string): Promise<{ message: string }> {
    // Transform camelCase to PascalCase for backend compatibility
    const requestData = {
      StartDate: startDate,
      EndDate: endDate,
      Reason: reason
    };

    return this.request(`/bookings/offers/${offerId}/block-dates`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async unblockDates(offerId: number, startDate: string, endDate: string): Promise<{ message: string }> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return this.request(`/bookings/offers/${offerId}/block-dates?${params.toString()}`, {
      method: 'DELETE',
    });
  }

  async getRecentCompletedBookings(count: number = 6): Promise<BookingResponse[]> {
    return this.request(`/bookings/recent-completed?count=${count}`);
  }

  // Rental Contract endpoints
  async generateContract(bookingId: number): Promise<RentalContract> {
    return this.request('/rental-contracts', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async getContract(contractId: number): Promise<RentalContract> {
    return this.request(`/rental-contracts/${contractId}`);
  }

  async getContractByBooking(bookingId: number): Promise<RentalContract> {
    return this.request(`/rental-contracts/booking/${bookingId}`);
  }

  async getMyContracts(): Promise<RentalContract[]> {
    return this.request('/rental-contracts/my-contracts');
  }

  async signContract(contractId: number): Promise<RentalContract> {
    return this.request(`/rental-contracts/${contractId}/sign`, {
      method: 'POST',
    });
  }

  async downloadContractPdf(contractId: number): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/rental-contracts/${contractId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download contract PDF');
    }

    return response.blob();
  }

  async cancelContract(contractId: number, reason?: string): Promise<RentalContract> {
    return this.request(`/rental-contracts/${contractId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // GDPR & Privacy Methods (getPrivacySettings and updatePrivacySettings defined earlier)

  async exportUserData(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/users/export-data`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  }

  async deleteAccount(): Promise<void> {
    return this.request('/users/delete-account', {
      method: 'DELETE',
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/verify-email?token=${token}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Email verification failed');
    }
  }

  async resendVerificationEmail(): Promise<void> {
    return this.request('/users/resend-verification', {
      method: 'POST',
    });
  }

  // Report Methods
  async reportOffer(offerId: number, reportType: number, description: string): Promise<any> {
    return this.request('/reports/offer', {
      method: 'POST',
      body: JSON.stringify({
        reportedOfferId: offerId,
        reportType,
        description,
      }),
    });
  }

  async reportUser(userId: number, reportType: number, description: string): Promise<any> {
    return this.request('/reports/user', {
      method: 'POST',
      body: JSON.stringify({
        reportedUserId: userId,
        reportType,
        description,
      }),
    });
  }

  async getMyReports(): Promise<any[]> {
    return this.request('/reports/my-reports');
  }

  // Admin Methods
  async getAdminReports(status?: string): Promise<any[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/reports${query}`);
  }

  async resolveReport(reportId: number, resolution: string, notes?: string): Promise<any> {
    return this.request(`/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, notes }),
    });
  }

  async suspendUser(userId: number, reason: string): Promise<void> {
    return this.request(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async removeOffer(offerId: number, reason: string): Promise<void> {
    return this.request(`/admin/offers/${offerId}/remove`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async adminDeleteOffer(offerId: number): Promise<void> {
    return this.request(`/offers/admin/${offerId}`, {
      method: 'DELETE',
    });
  }

  async getAllUsers(): Promise<AdminUser[]> {
    return this.request('/admin/users');
  }

  async adminToggleOfferActive(offerId: number): Promise<{ message: string; isActive: boolean }> {
    return this.request(`/admin/offers/${offerId}/toggle-active`, {
      method: 'POST',
    });
  }

  async toggleUserAdmin(userId: number): Promise<{ message: string; isAdmin: boolean }> {
    return this.request(`/admin/users/${userId}/toggle-admin`, {
      method: 'POST',
    });
  }

  async sendVerificationEmail(userId: number): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/send-verification-email`, {
      method: 'POST',
    });
  }

  async updateUserData(userId: number, data: {
    firstName?: string;
    lastName?: string;
    contactInfo?: {
      phoneNumber?: string;
      mobileNumber?: string;
      street?: string;
      city?: string;
      postalCode?: string;
      state?: string;
      country?: string;
    };
  }): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async reviewReport(reportId: number, status: number, resolutionNotes?: string): Promise<void> {
    return this.request(`/admin/reports/${reportId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  async reportOffer(offerId: number, reportType: number, description: string): Promise<{ message: string }> {
    return this.request(`/offers/${offerId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reportType, description }),
    });
  }
}

export const apiClient = new ApiClient();