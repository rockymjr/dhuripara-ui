import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' }
  ];

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-white text-gray-800 px-2 py-1 rounded text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer hover:border-gray-400 transition"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;