import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav: {
      explore: 'Explore',
      following: 'Following',
      sell: 'Sell',
      messages: 'Messages',
      search: 'Rechercher un article...',
      notifications: 'Notifications',
      no_notifs: 'Aucune notification'
    },
    product: {
      sold: 'VENDU',
      free_shipping: 'LIVRAISON GRATUITE',
      sell_again: 'Remettre en vente',
      mark_sold: 'Marquer comme vendu',
      edit: 'Modifier',
      delete: 'Supprimer',
      follow: 'Suivre',
      following: 'Suivi',
      followers: 'abonnés',
      direct: 'Direct',
      copied: 'Lien copié !'
    },
    discover: {
      title_explore: 'Explore',
      title_zenshop: 'ZenShop',
      subtitle: 'Discover the most exclusive items and services from our premium community.',
      search_placeholder: 'Nom du produit...',
      min_price: 'Prix Min',
      max_price: 'Prix Max',
      delivery: 'Livraison',
      free: 'Gratuite',
      paid: 'Payante',
      filter: 'Filtrer',
      no_results: 'Oups ! Aucun article trouvé.',
      try_adjusting: "Essayez d'ajuster vos filtres pour voir plus de pépites.",
      prev: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur'
    },
    cat: {
      'Tous': 'Tous',
      'Électronique': 'Électronique',
      'Vêtements': 'Vêtements',
      'Maison': 'Maison',
      'Services': 'Services',
      'Autres': 'Autres'
    }
  },
  en: {
    nav: {
      explore: 'Explore',
      following: 'Following',
      sell: 'Sell',
      messages: 'Messages',
      search: 'Search an item...',
      notifications: 'Notifications',
      no_notifs: 'No notifications'
    },
    product: {
      sold: 'SOLD',
      free_shipping: 'FREE SHIPPING',
      sell_again: 'Sell again',
      mark_sold: 'Mark as sold',
      edit: 'Edit',
      delete: 'Delete',
      follow: 'Follow',
      following: 'Following',
      followers: 'followers',
      direct: 'Direct',
      copied: 'Link copied!'
    },
    discover: {
      title_explore: 'Explore',
      title_zenshop: 'ZenShop',
      subtitle: 'Discover the most exclusive items and services from our premium community.',
      search_placeholder: 'Product name...',
      min_price: 'Min Price',
      max_price: 'Max Price',
      delivery: 'Delivery',
      free: 'Free',
      paid: 'Paid',
      filter: 'Filter',
      no_results: 'Oops! No items found.',
      try_adjusting: 'Try adjusting your filters to see more gems.',
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    cat: {
      'Tous': 'All',
      'Électronique': 'Electronics',
      'Vêtements': 'Clothing',
      'Maison': 'Home',
      'Services': 'Services',
      'Autres': 'Other'
    }
  },
  ar: {
    nav: {
      explore: 'اكتشف',
      following: 'تتابعهم',
      sell: 'بيع',
      messages: 'الرسائل',
      search: 'ابحث عن منتج...',
      notifications: 'الإشعارات',
      no_notifs: 'لا توجد إشعارات'
    },
    product: {
      sold: 'مباع',
      free_shipping: 'شحن مجاني',
      sell_again: 'إعادة عرض للبيع',
      mark_sold: 'تحديد كمباع',
      edit: 'تعديل',
      delete: 'حذف',
      follow: 'متابعة',
      following: 'تتابعه',
      followers: 'متابعون',
      direct: 'مراسلة',
      copied: 'تم نسخ الرابط!'
    },
    discover: {
      title_explore: 'اكتشف',
      title_zenshop: 'زين شوب',
      subtitle: 'اكتشف أندر المنتجات والخدمات من مجتمعنا المتميز.',
      search_placeholder: 'اسم المنتج...',
      min_price: 'أقل سعر',
      max_price: 'أعلى سعر',
      delivery: 'التوصيل',
      free: 'مجاني',
      paid: 'مدفوع',
      filter: 'تصفية',
      no_results: 'عذراً! لم يتم العثور على أي عناصر.',
      try_adjusting: 'حاول تعديل فلاتر البحث لرؤية المزيد من المنتجات.',
      prev: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من'
    },
    cat: {
      'Tous': 'الكل',
      'Électronique': 'إلكترونيات',
      'Vêtements': 'أزياء',
      'Maison': 'المنزل',
      'Services': 'خدمات',
      'Autres': 'أخرى'
    }
  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; 
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
