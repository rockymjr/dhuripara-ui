// src/utils/analytics.js
import ReactGA from 'react-ga4';

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

export const initGA = () => {
  if (TRACKING_ID) {
    ReactGA.initialize(TRACKING_ID, {
      gaOptions: {
        anonymizeIp: true, // Privacy: anonymize IP addresses
      },
    });
    console.log('Google Analytics initialized');
  } else {
    console.warn('Google Analytics tracking ID not found');
  }
};

// Track page views
export const trackPageView = (path, title) => {
  if (TRACKING_ID) {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title,
    });
  }
};

// Track custom events
export const trackEvent = (category, action, label = '', value = 0) => {
  if (TRACKING_ID) {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      value: value,
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName, section = '') => {
  trackEvent('Button', 'Click', `${section} - ${buttonName}`);
};

// Track form submissions
export const trackFormSubmit = (formName, success = true) => {
  trackEvent('Form', success ? 'Submit Success' : 'Submit Failed', formName);
};

// Track user authentication
export const trackAuth = (action, method = '') => {
  trackEvent('Authentication', action, method);
};

// Track transactions/deposits/loans
export const trackTransaction = (type, amount, memberId = '') => {
  trackEvent('Transaction', type, memberId, amount);
};

// Track errors
export const trackError = (errorType, errorMessage = '') => {
  trackEvent('Error', errorType, errorMessage);
};

// Track user timing (performance)
export const trackTiming = (category, variable, value, label = '') => {
  if (TRACKING_ID) {
    ReactGA.send({
      hitType: 'timing',
      timingCategory: category,
      timingVar: variable,
      timingValue: value,
      timingLabel: label,
    });
  }
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackFormSubmit,
  trackAuth,
  trackTransaction,
  trackError,
  trackTiming,
};