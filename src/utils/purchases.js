import { Platform } from 'react-native';

// RevenueCat wrapper - gracefully handles missing SDK in dev/web
let Purchases = null;
try { Purchases = require('react-native-purchases').default; } catch (e) {}

import { REVENUECAT_API_KEY_ANDROID, ENTITLEMENT_PREMIUM } from '../constants/config';

export async function initPurchases(userId) {
  if (!Purchases) return;
  try {
    if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID, appUserID: userId });
    }
  } catch (e) { console.log('RevenueCat init failed:', e.message); }
}

export async function getOfferings() {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) { return null; }
}

export async function purchasePackage(pkg) {
  if (!Purchases) throw new Error('Purchases not available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return isPremium(customerInfo);
  } catch (e) { return false; }
}

export async function checkPremiumStatus() {
  if (!Purchases) return false; // Dev mode — all features unlocked
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return isPremium(customerInfo);
  } catch (e) { return false; }
}

export function isPremium(customerInfo) {
  return typeof customerInfo?.entitlements?.active?.[ENTITLEMENT_PREMIUM] !== 'undefined';
}
