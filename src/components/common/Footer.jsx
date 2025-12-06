import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm sm:text-base">&copy; 2025 {t('appName')}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;