import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav: {
      explore: 'Explore',
      following: 'Following',
      sell: 'Sell',
      messages: 'Messages',
      profile: 'Profil',
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
    },
    auth: {
      subtitle: 'Créons une expérience de shopping inédite',
      email: 'Adresse Email',
      password: 'Mot de passe',
      signin: 'Se connecter',
      signing_in: 'Connexion...',
      forgot: 'Mot de passe oublié ?',
      no_account: 'Pas encore de compte ?',
      create_account: 'Créer un profil',
      register_title: 'Rejoignez ZenShop',
      register_subtitle: 'Devenez membre privilège',
      name: 'Votre nom',
      name_placeholder: 'Ex: Jean Dupont',
      creating: 'Création...',
      already_have: 'Déjà membre ?',
      log_in_link: 'Connectez-vous',
      reset_pass: 'Réinitialiser le mot de passe',
      send_link: 'Envoyer le lien',
      sending: 'Envoi en cours...',
      verify_email: 'Vérifiez votre Email',
      code_sent: 'Un code à 6 chiffres a été envoyé à',
      verifyBtn: 'Vérifier',
      verifying: 'Vérification...',
      resend: 'Renvoyer le code',
      resending: 'Renvoi...',
      finishing: 'Enregistrement...',
      verify_success: 'Vérification réussie !',
      invalid_code: 'Code invalide',
      otp_resent: 'Un nouveau code a été envoyé !',
      resend_error: 'Erreur lors de l\'envoi',
      forgot_msg: 'Un code de récupération a été envoyé à votre email.',
      back_login: 'Retour à la connexion',
      reset_title: 'Nouveau Pass',
      reset_subtitle: 'Entrez le code reçu et votre nouveau mot de passe',
      code_placeholder: '6 chiffres',
      new_password: 'Nouveau mot de passe',
      confirm_password: 'Confirmer le mot de passe',
      pass_match_error: 'Les mots de passe ne correspondent pas',
      reset_success: 'Mot de passe mis à jour ! Redirection...',
      reset_error: 'Code invalide ou expiré',
      reset_btn: 'Réinitialiser',
      updating: 'Mise à jour...',
      error_generic: 'Une erreur est سورvenue'
    },
    add_product: {
      title_add: 'Vendre un article',
      title_edit: 'Modifier l\'article',
      contact_title: 'Contact Acheteur (WhatsApp)',
      contact_desc: 'Ce numéro sera visible pour les acheteurs potentiels.',
      gallery: 'Galerie visuelle',
      add_images: 'Ajouter des images',
      drop_images: 'Glissez des fichiers ici ou cliquez pour parcourir',
      category: 'Catégorie',
      name: 'Nom du produit',
      desc: 'Description',
      price_label: 'Prix (€)',
      delivery_label: 'Livraison (€, 0 = Gratuit)',
      publish: 'Publier l\'article',
      update: 'Mettre à jour',
      saving: 'Enregistrement...'
    },
    messages: {
      inbox: 'Boîte de réception',
      today: 'Aujourd\'hui',
      msg_placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      select_conv: 'Sélectionnez une conversation ou commencez-en une nouvelle.',
      no_messages: 'Aucun message pour le moment.'
    },
    profile: {
      followers: 'abonnés',
      following: 'suivis',
      edit: 'Modifier le profil',
      joined: 'Membre depuis',
      my_items: 'Mes articles',
      verified: 'Verifié',
      save: 'Sauvegarder les modifications',
      saving: 'Enregistrement...',
      back: 'Retour',
      sales: 'Ventes',
      store_of: 'Boutique de',
      no_products: 'Cet utilisateur n\'a pas encore posté d\'articles.',
      msg: 'Message',
      follow: 'Suivre',
      followed: 'Suivi',
      items: 'Articles',
      loading_error: 'Erreur lors du chargement du profil',
      not_found: 'Profil introuvable',
      premium_since: 'Membre Premium depuis',
      bio_label: 'Bio (Dites-en un peu plus sur vous)',
      whatsapp_label: 'Numéro WhatsApp (Format international)',
      bio_placeholder: 'Vendeur passionné, collectionneur...',
      loading: 'Chargement...',
      update_success: 'Profil mis à jour !',
      update_error: 'Erreur lors de la mise à jour',
      image_limit: 'L\'image doit faire moins de 2Mo'
    },
    following_tab: {
      title: 'Articles des vendeurs suivis',
      empty: 'Vous ne suivez aucun vendeur ou ils n\'ont pas encore de produits.',
      explore: 'Explorez l\'onglet Découvrir pour trouver des vendeurs !'
    },
    common: {
      confirm: 'Confirmer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      close: 'Fermer',
      pro_member: 'Membre Pro'
    }
  },
  en: {
    nav: {
      explore: 'Explore',
      following: 'Following',
      sell: 'Sell',
      messages: 'Messages',
      profile: 'Profile',
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
    },
    auth: {
      subtitle: 'Elevate your shopping experience',
      email: 'Email Address',
      password: 'Password',
      signin: 'Sign In',
      signing_in: 'Authenticating...',
      forgot: 'Forgot password?',
      no_account: 'Don\'t have an account?',
      create_account: 'Create a profile',
      register_title: 'Join ZenShop',
      register_subtitle: 'Become a premium member',
      name: 'Full Name',
      name_placeholder: 'E.g. John Doe',
      creating: 'Creating...',
      already_have: 'Already a member?',
      log_in_link: 'Sign In here',
      reset_pass: 'Reset Password',
      send_link: 'Send Link',
      sending: 'Sending...',
      verify_email: 'Verify your Email',
      code_sent: 'A 6-digit code has been sent to',
      verifyBtn: 'Verify',
      verifying: 'Verifying...',
      resend: 'Resend code',
      resending: 'Resending...',
      finishing: 'Saving...',
      verify_success: 'Verification successful!',
      invalid_code: 'Invalid code',
      otp_resent: 'New code sent!',
      resend_error: 'Error sending code',
      forgot_msg: 'A recovery code has been sent to your email.',
      back_login: 'Back to login',
      reset_title: 'New Password',
      reset_subtitle: 'Enter the code you received and your new password',
      code_placeholder: '6 digits',
      new_password: 'New password',
      confirm_password: 'Confirm password',
      pass_match_error: 'Passwords do not match',
      reset_success: 'Password updated! Redirecting...',
      reset_error: 'Invalid or expired code',
      reset_btn: 'Reset Password',
      updating: 'Updating...',
      error_generic: 'An error occurred'
    },
    add_product: {
      title_add: 'Sell Your Item',
      title_edit: 'Refine Listing',
      contact_title: 'Buyer Contact (WhatsApp)',
      contact_desc: 'This number will be visible to potential buyers.',
      gallery: 'Visual Gallery',
      add_images: 'Add Gallery Images',
      drop_images: 'Drop files here or click to browse',
      category: 'Category',
      name: 'Product Name',
      desc: 'Description',
      price_label: 'Price (€)',
      delivery_label: 'Delivery (€, 0 = Free)',
      publish: 'Publish Listing',
      update: 'Update Listing',
      saving: 'Saving...'
    },
    messages: {
      inbox: 'Inbox',
      today: 'Today',
      msg_placeholder: 'Type your message...',
      send: 'Send',
      select_conv: 'Select a conversation or start a new one.',
      no_messages: 'No messages yet.'
    },
    profile: {
      followers: 'followers',
      following: 'following',
      edit: 'Edit Profile',
      joined: 'Joined',
      my_items: 'My Listings',
      verified: 'Verified',
      save: 'Save Changes',
      saving: 'Saving...',
      back: 'Back',
      sales: 'Sales',
      store_of: 'Store of',
      no_products: 'This user has not posted any items yet.',
      msg: 'Message',
      follow: 'Follow',
      followed: 'Following',
      items: 'Items',
      loading_error: 'Error loading profile',
      not_found: 'Profile not found',
      premium_since: 'Premium member since',
      bio_label: 'Bio (Tell us a bit more about yourself)',
      whatsapp_label: 'WhatsApp Number (International format)',
      bio_placeholder: 'Passionate seller, collector...',
      loading: 'Loading...',
      update_success: 'Profile updated!',
      update_error: 'Error updating profile',
      image_limit: 'Image must be less than 2MB'
    },
    following_tab: {
      title: 'Items from followed sellers',
      empty: 'You aren\'t following any sellers or they have no items.',
      explore: 'Explore the Discover tab to find sellers!'
    },
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      close: 'Close',
      pro_member: 'Pro Member'
    }
  },
  ar: {
    nav: {
      explore: 'اكتشف',
      following: 'تتابعهم',
      sell: 'بيع',
      messages: 'الرسائل',
      profile: 'حسابي',
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
    },
    auth: {
      subtitle: 'ارتقِ بتجربة التسوق الخاصة بك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signin: 'تسجيل الدخول',
      signing_in: 'جاري تسجيل الدخول...',
      forgot: 'نسيت كلمة المرور؟',
      no_account: 'ليس لديك حساب؟',
      create_account: 'إنشاء حساب جديد',
      register_title: 'انضم إلى زين شوب',
      register_subtitle: 'احصل على عضوية مميزة وابدأ البيع',
      name: 'الاسم الكامل',
      name_placeholder: 'مثال: محمد عبدالله',
      creating: 'جاري الإنشاء...',
      already_have: 'عضو مسجل؟',
      log_in_link: 'سجل دخولك من هنا',
      reset_pass: 'استعادة كلمة المرور',
      send_link: 'إرسال الرابط',
      sending: 'جاري الإرسال...',
      verify_email: 'تأكيد البريد الإلكتروني',
      code_sent: 'تم إرسال رمز من 6 أرقام إلى',
      verifyBtn: 'تأكيد',
      verifying: 'جاري التأكيد...',
      resend: 'إعادة إرسال الرمز',
      resending: 'جاري الإرسال...',
      finishing: 'جاري الحفظ...',
      verify_success: 'تم التحقق بنجاح!',
      invalid_code: 'رمز غير صحيح',
      otp_resent: 'تم إرسال رمز جديد!',
      resend_error: 'خطأ في إرسال الرمز',
      forgot_msg: 'تم إرسال رمز الاستعادة إلى بريدك الإلكتروني.',
      back_login: 'العودة لتسجيل الدخول',
      reset_title: 'كلمة مرور جديدة',
      reset_subtitle: 'أدخل الرمز المستلم وكلمة المرور الجديدة',
      code_placeholder: '6 أرقام',
      new_password: 'كلمة المرور الجديدة',
      confirm_password: 'تأكيد كلمة المرور',
      pass_match_error: 'كلمات المرور غير متطابقة',
      reset_success: 'تم تحديث كلمة المرور! جاري التحويل...',
      reset_error: 'رمز غير صحيح أو منتهي الصلاحية',
      reset_btn: 'إعادة تعيين',
      updating: 'جاري التحديث...',
      error_generic: 'حدث خطأ ما'
    },
    add_product: {
      title_add: 'انشر منتجك للبيع',
      title_edit: 'تعديل بيانات المنتج',
      contact_title: 'رقم واتساب للتواصل مع المشتري',
      contact_desc: 'سيتم عرض هذا الرقم للمشترين للتواصل معك.',
      gallery: 'الصور المرفقة',
      add_images: 'أضف صور للمنتج',
      drop_images: 'اسحب الملفات هنا أو اضغط للاستعراض',
      category: 'التصنيف',
      name: 'اسم المنتج',
      desc: 'الوصف',
      price_label: 'السعر',
      delivery_label: 'التوصيل (0 = مجاني)',
      publish: 'نشر المنتج',
      update: 'تحديث المنتج',
      saving: 'جاري الحفظ...'
    },
    messages: {
      inbox: 'صندوق الوارد',
      today: 'اليوم',
      msg_placeholder: 'اكتب رسالتك...',
      send: 'إرسال',
      select_conv: 'اختر محادثة أو ابدأ واحدة جديدة.',
      no_messages: 'لا يوجد رسائل حتى الآن.'
    },
    profile: {
      followers: 'متابعون',
      following: 'يتابع',
      edit: 'تعديل الملف',
      joined: 'انضم في',
      my_items: 'إعلاناتي',
      verified: 'موثق',
      save: 'حفظ التعديلات',
      saving: 'جاري الحفظ...',
      back: 'رجوع',
      sales: 'المبيعات',
      store_of: 'متجر',
      no_products: 'هذا المستخدم لم يقم بنشر أي شيء حتى الآن.',
      msg: 'مراسلة',
      follow: 'متابعة',
      followed: 'تتابعه',
      items: 'منتجات',
      loading_error: 'خطأ في تحميل الملف الشخصي',
      not_found: 'تعذر العثور على الملف الشخصي',
      premium_since: 'عضو مميز منذ',
      bio_label: 'نبذة عنك (أخبرنا المزيد عنك)',
      whatsapp_label: 'رقم الواتساب (بالصيغة الدولية)',
      bio_placeholder: 'بائع شغوف، هاوٍ لجمع المقتنيات...',
      loading: 'جاري التحميل...',
      update_success: 'تم تحديث الملف الشخصي!',
      update_error: 'خطأ في تحديث الملف الشخصي',
      image_limit: 'الصورة يجب أن تكون أقل من 2 ميجابايت'
    },
    following_tab: {
      title: 'إعلانات البائعين الذين تتابعهم',
      empty: 'أنت لا تتابع أحداً أو أنه لا توجد إعلانات لديهم حالياً.',
      explore: 'تصفح تبويب اكتشف للبحث عن المزيد من البائعين!'
    },
    common: {
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      loading: 'جاري التحميل...',
      close: 'إغلاق',
      pro_member: 'عضو محترف'
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
