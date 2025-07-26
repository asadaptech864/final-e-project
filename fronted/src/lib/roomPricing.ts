// Room pricing utility functions

export interface RoomRate {
  roomType: string;
  baseRate: number;
  weekendRate: number;
  holidayRate: number;
  seasonalRates: Array<{
    season: string;
    rate: number;
    startDate: string;
    endDate: string;
  }>;
}

export interface SystemSettings {
  roomRates: RoomRate[];
  general: {
    currency: string;
  };
  taxes?: {
    taxRate: number;
    serviceCharge: number;
    cityTax: number;
    stateTax: number;
  };
}

/**
 * Calculate the appropriate rate for a room type based on date
 */
export const calculateRoomRate = (
  roomType: string,
  date: Date,
  settings: SystemSettings | null
): number => {
  if (!settings || !settings.roomRates) {
    return 0;
  }

  const roomRate = settings.roomRates.find(rate => rate.roomType === roomType);
  if (!roomRate) {
    return 0;
  }

  // Check if it's a weekend (Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check if it's a holiday (you can expand this logic)
  const isHoliday = isHolidayDate(date);

  // Check seasonal rates
  const seasonalRate = getSeasonalRate(date, roomRate.seasonalRates);

  // Priority: Seasonal > Holiday > Weekend > Base
  if (seasonalRate > 0) {
    return seasonalRate;
  } else if (isHoliday && roomRate.holidayRate > 0) {
    return roomRate.holidayRate;
  } else if (isWeekend && roomRate.weekendRate > 0) {
    return roomRate.weekendRate;
  } else {
    return roomRate.baseRate;
  }
};

/**
 * Calculate total price for a room booking
 */
export const calculateTotalPrice = (
  roomType: string,
  checkin: Date,
  checkout: Date,
  guests: number, // Keep parameter for compatibility but don't use for room calculation
  additionalServices: any,
  settings: SystemSettings | null
): number => {
  let total = 0;
  const currentDate = new Date(checkin);

  // Calculate room rate for each night
  while (currentDate < checkout) {
    const nightlyRate = calculateRoomRate(roomType, currentDate, settings);
    total += nightlyRate;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Don't multiply by number of guests - room rate is per night, not per guest

  // Add additional services
  if (additionalServices?.spa) total += 50;
  if (additionalServices?.airport) total += 30;
  if (additionalServices?.wakeup) total += 10;

  return total;
};

/**
 * Get the current rate for a room type (for display purposes)
 */
export const getCurrentRoomRate = (
  roomType: string,
  settings: SystemSettings | null
): number => {
  if (!settings || !settings.roomRates) {
    return 0;
  }

  const roomRate = settings.roomRates.find(rate => rate.roomType === roomType);
  if (!roomRate) {
    return 0;
  }

  // Use current date to determine the appropriate rate
  const currentDate = new Date();
  
  // Check if it's a weekend (Saturday = 6, Sunday = 0)
  const dayOfWeek = currentDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check if it's a holiday
  const isHoliday = isHolidayDate(currentDate);

  // Check seasonal rates
  const seasonalRate = getSeasonalRate(currentDate, roomRate.seasonalRates);

  // Priority: Seasonal > Holiday > Weekend > Base
  if (seasonalRate > 0) {
    return seasonalRate;
  } else if (isHoliday && roomRate.holidayRate > 0) {
    return roomRate.holidayRate;
  } else if (isWeekend && roomRate.weekendRate > 0) {
    return roomRate.weekendRate;
  } else {
    return roomRate.baseRate;
  }
};

/**
 * Check if a date is a holiday (basic implementation)
 * You can expand this with actual holiday dates
 */
const isHolidayDate = (date: Date): boolean => {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Basic holiday check (you can expand this)
  const holidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 6, day: 4 },   // Independence Day
    { month: 11, day: 25 }, // Christmas
  ];

  return holidays.some(holiday => holiday.month === month && holiday.day === day);
};

/**
 * Get seasonal rate for a specific date
 */
const getSeasonalRate = (
  date: Date,
  seasonalRates: RoomRate['seasonalRates']
): number => {
  if (!seasonalRates || seasonalRates.length === 0) {
    return 0;
  }

  const currentDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  for (const seasonalRate of seasonalRates) {
    if (currentDate >= seasonalRate.startDate && currentDate <= seasonalRate.endDate) {
      return seasonalRate.rate;
    }
  }

  return 0;
};

/**
 * Format currency based on settings
 */
export const formatCurrency = (
  amount: number,
  settings: SystemSettings | null
): string => {
  const currency = settings?.general?.currency || 'USD';
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
}; 