// src/i18n/index.js
const translations = {
  en: {
    // App
    appName: 'Dhuripara Bank',
    summary: 'Fund Summary',
    
    // Navigation
    home: 'Home',
    deposits: 'Deposits',
    loans: 'Loans',
    admin: 'Admin',
    memberLogin: 'Member Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    submit: 'Submit',
    close: 'Close',
    actions: 'Actions',
    month: 'Month',
    day: 'Day',
    
    // Dashboard
    totalDeposits: 'Total Deposits',
    totalLoans: 'Total Loans',
    availableBalance: 'Available Balance',
    activeDeposits: 'Active Deposits',
    activeLoans: 'Active Loans',
    financialYear: 'Financial Year',
    bankProfit: 'Bank Profit',
    activeDepositsWithInterest: 'Active Deposits (with Interest)',
    activeLoansWithInterest: 'Active Loans (with Interest)',

    yourTotalDeposits: 'Your Total Deposits',
    yourTotalLoans: 'Your Total Loans',
    yourCurrentLoan: 'Your Current Loan',
    yourActiveDeposits: 'Your Active Deposits',
    yourTotalInterestEarned: 'Your Total Interest Earned',
    yourCurrentInterest: 'Your Current Interest',
    totalInterest: 'Total Interest',
    
    // Members
    members: 'Members',
    addMember: 'Add Member',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    pin: 'PIN',
    joiningDate: 'Joining Date',
    status: 'Status',
    memberName: 'Member Name',
    memberStatement: 'Member Statement',
    memberInformation: 'Member Information',
    
    // Deposits
    addDeposit: 'Add Deposit',
    amount: 'Amount',
    depositDate: 'Deposit Date',
    interestRate: 'Interest Rate',
    interestEarned: 'Interest Earned',
    currentInterest: 'Current Interest',
    totalAmount: 'Total Amount',
    returnDeposit: 'Return Deposit',
    currentTotal: 'Current Total',
    returnDate: 'Return Date',
    depositManagement: 'Deposit Management',
    monthlyInterest: 'Monthly Interest',
    duration: 'Duration',
    noDepositsFound: 'No deposits found',
    
    // Loans
    sanctionLoan: 'Sanction Loan',
    loanAmount: 'Loan Amount',
    loanDate: 'Loan Date',
    interestPaid: 'Interest Paid',
    paidAmount: 'Paid Amount',
    remainingAmount: 'Remaining Amount',
    addPayment: 'Add Payment',
    closeLoan: 'Close Loan',
    paymentHistory: 'Payment History',
    paidDiscount: 'Paid',
    loanManagement: 'Loan Management',
    loadingLoans: 'Loading Loans...',
    allLoans: 'All Loans',
    noLoansFound: 'No Loans Found',
    due: 'Due',
    paid: 'Paid',

    // Status
    active: 'Active',
    closed: 'Closed',
    returned: 'Returned',
    settled: 'Settled',
    inactive: 'Inactive',
    
    // Login
    loginTitle: 'Login',
    username: 'Username',
    password: 'Password',
    memberLoginTitle: 'Member Login',
    adminLogin: 'Admin Login',
    
    // Messages
    success: 'Success',
    error: 'Error',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    notFound: 'Not found',
    
    // Validation
    required: 'This field is required',
    invalidPhone: 'Phone must be 10 digits',
    invalidPin: 'PIN must be 4 digits',
    amountPositive: 'Amount must be greater than 0',
  },
  
  hi: {
    // App
    appName: 'धुरीपाड़ा ग्रामीण बैंक',
    summary: 'धन सारांश',
    
    // Navigation
    home: 'होम',
    deposits: 'जमा',
    loans: 'ऋण',
    admin: 'प्रशासक',
    memberLogin: 'सदस्य लॉगिन',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    
    // Common
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    loading: 'लोड हो रहा है...',
    submit: 'जमा करें',
    close: 'बंद करें',
    actions: 'क्रियाएं',
    month: 'महीना',
    day: 'दिन',
    
    // Member Dashboard
    totalDeposits: 'कुल जमा',
    totalLoans: 'कुल ऋण',
    availableBalance: 'उपलब्ध शेष',
    activeDeposits: 'सक्रिय जमा',
    activeLoans: 'सक्रिय ऋण',
    financialYear: 'वित्तीय वर्ष',
    bankProfit: 'बैंक लाभ',
    activeDepositsWithInterest: 'सक्रिय जमा (ब्याज सहित)',
    activeLoansWithInterest: 'सक्रिय ऋण (ब्याज सहित)',
    yourTotalDeposits: 'आपकी कुल जमा',
    yourTotalLoans: 'आपकी कुल ऋण',
    yourCurrentLoan: 'आपकी वर्तमान ऋण',
    yourActiveDeposits: 'आपकी सक्रिय जमा',
    yourTotalInterestEarned: 'आपका कुल अर्जित ब्याज',
    yourCurrentInterest: 'आपका वर्तमान ब्याज',
    totalInterest: 'कुल ब्याज',

    
    // Members
    members: 'सदस्य',
    addMember: 'सदस्य जोड़ें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    phone: 'फ़ोन नंबर',
    pin: 'पिन',
    joiningDate: 'शामिल होने की तारीख',
    status: 'स्थिति',
    memberName: 'सदस्य का नाम',
    memberStatement: 'सदस्य विवरण',
    memberInformation: 'सदस्य जानकारी',
    
    // Deposits
    addDeposit: 'जमा जोड़ें',
    amount: 'राशि',
    depositDate: 'जमा तिथि',
    interestRate: 'ब्याज दर',
    interestEarned: 'अर्जित ब्याज',
    currentInterest: 'वर्तमान ब्याज',
    totalAmount: 'कुल राशि',
    returnDeposit: 'जमा वापसी',
    currentTotal: 'वर्तमान कुल',
    returnDate: 'वापसी तिथि',
    depositManagement: 'जमा प्रबंधन',
    monthlyInterest: 'मासिक ब्याज',
    duration: 'अवधि',
    noDepositsFound: 'कोई जमा नहीं मिला',
    
    // Loans
    sanctionLoan: 'ऋण स्वीकृत करें',
    loanAmount: 'ऋण राशि',
    loanDate: 'ऋण तिथि',
    interestPaid: 'भुगतान किया गया ब्याज',
    paidAmount: 'भुगतान की गई राशि',
    remainingAmount: 'शेष राशि',
    addPayment: 'भुगतान जोड़ें',
    closeLoan: 'ऋण बंद करें',
    paymentHistory: 'भुगतान इतिहास',
    paidDiscount: 'भुगतान किया गया',
    loanManagement: 'ऋण प्रबंधन',
    loadingLoans: 'ऋण लोड हो रहा है...',
    allLoans: 'सभी ऋण',
    noLoansFound: 'कोई ऋण नहीं मिला',
    due: 'बकाया',
    paid: 'भुगतान',
    
    // Status
    active: 'सक्रिय',
    closed: 'बंद',
    returned: 'वापस किया गया',
    settled: 'निपटान',
    inactive: 'निष्क्रिय',
    
    // Login
    loginTitle: 'Login',
    username: 'उपयोगकर्ता नाम',
    password: 'पासवर्ड',
    memberLoginTitle: 'सदस्य लॉगिन',
    adminLogin: 'प्रशासक लॉगिन',
    
    // Messages
    success: 'सफलता',
    error: 'त्रुटि',
    created: 'सफलतापूर्वक बनाया गया',
    updated: 'सफलतापूर्वक अपडेट किया गया',
    deleted: 'सफलतापूर्वक हटाया गया',
    notFound: 'नहीं मिला',
    
    // Validation
    required: 'यह फ़ील्ड आवश्यक है',
    invalidPhone: 'फ़ोन 10 अंकों का होना चाहिए',
    invalidPin: 'पिन 4 अंकों का होना चाहिए',
    amountPositive: 'राशि 0 से अधिक होनी चाहिए',
  },
  
  bn: {
    // App
    appName: 'ঢুড়িপাড়া গ্রামীণ ব্যাংক',
    summary: ' ',
    
    // Navigation
    home: 'হোম',
    deposits: 'জমা',
    loans: 'ঋণ',
    admin: 'প্রশাসক',
    memberLogin: 'সদস্য লগইন',
    logout: 'লগ আউট',
    dashboard: 'ড্যাশবোর্ড',
    
    // Common
    save: 'save',
    cancel: 'Cancel',
    delete: 'delete',
    edit: 'edit',
    view: 'দেখুন',
    search: 'খুঁজুন',
    filter: 'ফিল্টার',
    loading: 'লোড হচ্ছে...',
    submit: 'জমা দিন',
    close: 'বন্ধ করুন',
    actions: 'Action',
    month: 'মাস',
    day: 'দিন',
    
    // Dashboard
    totalDeposits: 'মোট জমা পড়েছে',
    totalLoans: 'মোট ঋণ দেওয়া হয়েছে',
    availableBalance: 'ব্যাঙ্কের বর্তমান ব্যালেন্স',
    activeDeposits: 'বর্তমান জমা',
    activeLoans: 'বর্তমান ঋণ',
    bankProfit: 'মোট লাভ হয়েছে',
    financialYear: 'বছর',
    activeDepositsWithInterest: 'বর্তমান জমা (সুদ সমেত)',
    activeLoansWithInterest: 'বর্তমান ঋণ (সুদ সমেত)',
    yourTotalDeposits: 'আপনি মোট জমা করেছেন',  
    yourTotalLoans: 'আপনি মোট ঋণ নিয়েছেন',
    yourCurrentLoan: 'আপনার বর্তমান ঋণ',
    yourActiveDeposits: 'আপনার বর্তমান জমা আছে',
    yourTotalInterestEarned: 'আপনি মোট সুদ পেয়েছেন',
    yourCurrentInterest: 'আপনার বর্তমান পাবেন',
    yourTotalInterestPaid: 'আপনি মোট সুদ দিয়েছেন',
    yourCurrentInterest: 'আপনার বর্তমান সুদ হয়েছে ',
    totalInterest: 'মোট সুদ',

    // Members
    members: 'সদস্য',
    addMember: 'সদস্য যোগ করুন',
    firstName: 'নাম',
    lastName: 'শিরোনাম',
    phone: 'ফোন নম্বর',
    pin: 'পিন',
    joiningDate: 'যোগদানের তারিখ',
    status: 'অবস্থা',
    memberName: 'সদস্যের নাম',
    memberStatement: 'সদস্য বিবরণ',
    memberInformation: 'সদস্য তথ্য',
    
    // Deposits
    addDeposit: 'জমা করুন',
    amount: 'টাকা',
    depositDate: 'জমা তারিখ',
    interestRate: 'সুদের হার',
    monthlyInterest: 'মাসিক সুদ',
    interestEarned: 'মোট সুদ',
    currentInterest: 'বর্তমান সুদ',
    totalAmount: 'মোট টাকা',
    returnDeposit: 'ফেরত তারিখ',
    currentTotal: 'বর্তমান মোট টাকা',
    duration: 'সময়',
    allDeposits: 'সমস্ত জমা',
    returnDate: 'ফেরত তারিখ',
    depositManagement: 'জমা ব্যবস্থাপনা',
    noDepositsFound: 'কোন জমা পাওয়া যায়নি',
    
    // Loans
    sanctionLoan: 'ঋণ অনুমোদন করুন',
    loanAmount: 'ঋণের টাকা',
    loanDate: 'ঋণের তারিখ',
    interestPaid: 'সুদ জমা',
    paidAmount: 'জমা',
    totalInterest : 'মোট সুদ',
    remainingAmount: 'বাকি',
    addPayment: 'পেমেন্ট করুন',
    closeLoan: 'ঋণ বন্ধ করুন',
    paymentHistory: 'পেমেন্ট ইতিহাস',
    paidDiscount: 'জমা',
    loanManagement: 'ঋণ ব্যবস্থাপনা',
    loadingLoans: 'ঋণ লোড হচ্ছে..',
    allLoans: 'সমস্ত ঋণ',
    noLoansFound: 'কোন ঋণ পাওয়া যায়নি',
    due: 'বাকি',
    paid: 'জমা',
    
    // Status
    active: 'সক্রিয়',
    closed: 'বন্ধ',
    returned: 'ফেরত',
    settled: 'নিষ্পত্তি',
    inactive: 'নিষ্ক্রিয়',
    
    // Login
    loginTitle: 'Login',
    username: 'Username',
    password: 'Password',
    memberLoginTitle: 'Member Login',
    adminLogin: 'Admin Login',
    
    // Messages
    success: 'সফল',
    error: 'Error',
    created: 'সফলভাবে তৈরি হয়েছে',
    updated: 'সফলভাবে আপডেট হয়েছে',
    deleted: 'সফলভাবে মুছে ফেলা হয়েছে',
    notFound: 'পাওয়া যায়নি',
    
    // Validation
    required: 'এই ক্ষেত্রটি আবশ্যক',
    invalidPhone: 'ফোন অবশ্যই 10 সংখ্যার হতে হবে',
    invalidPin: 'পিন অবশ্যই 4 সংখ্যার হতে হবে',
    amountPositive: 'পরিমাণ 0 এর চেয়ে বেশি হতে হবে',
  }
};

export default translations;