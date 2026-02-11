import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { useAuth } from './AuthProvider';

const ENTITLEMENT_ID = 'pro';

function getRCApiKey(): string | undefined {
  if (Platform.OS === 'web') {
    console.log('[rc] Web platform detected, RevenueCat not supported');
    return undefined;
  }
  const key = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: undefined,
  });
  if (!key || key.trim().length === 0 || key === 'undefined') {
    console.log('[rc] API key is empty or invalid, skipping');
    return undefined;
  }
  return key;
}

let rcConfigured = false;

function configureRC() {
  if (rcConfigured) return true;
  const apiKey = getRCApiKey();
  if (!apiKey) {
    console.log('[rc] No RevenueCat API key found, skipping init');
    return false;
  }
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    rcConfigured = true;
    console.log('[rc] RevenueCat configured successfully');
    return true;
  } catch (e) {
    console.log('[rc] Failed to configure RevenueCat:', e);
    return false;
  }
}

try {
  configureRC();
} catch (e) {
  console.log('[rc] Top-level configureRC error caught:', e);
}

export const [RevenueCatProvider, useRevenueCat] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConfigured] = useState<boolean>(rcConfigured);

  useEffect(() => {
    if (!isConfigured || !user?.id) return;
    console.log('[rc] Logging in user:', user.id);
    Purchases.logIn(user.id).catch((e) =>
      console.log('[rc] Failed to log in user:', e)
    );
  }, [isConfigured, user?.id]);

  useEffect(() => {
    if (!isConfigured || user) return;
    console.log('[rc] No user, logging out of RC');
    Purchases.logOut().catch(() => {});
  }, [isConfigured, user]);

  const offeringsQuery = useQuery({
    queryKey: ['rc_offerings', isConfigured],
    queryFn: async (): Promise<PurchasesOfferings | null> => {
      if (!isConfigured) return null;
      console.log('[rc] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('[rc] Offerings fetched:', offerings.current?.identifier);
      return offerings;
    },
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const customerInfoQuery = useQuery({
    queryKey: ['rc_customer_info', isConfigured],
    queryFn: async (): Promise<CustomerInfo | null> => {
      if (!isConfigured) return null;
      console.log('[rc] Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('[rc] Customer info fetched, entitlements:', Object.keys(info.entitlements.active));
      return info;
    },
    enabled: isConfigured && !!user,
    staleTime: 30 * 1000,
  });

  const isPremium = !!customerInfoQuery.data?.entitlements?.active?.[ENTITLEMENT_ID];

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('[rc] Purchasing package:', pkg.identifier);
      const result = await Purchases.purchasePackage(pkg);
      console.log('[rc] Purchase result:', result.customerInfo.entitlements.active);
      return result.customerInfo;
    },
    onSuccess: (customerInfo) => {
      queryClient.setQueryData(['rc_customer_info'], customerInfo);
      queryClient.invalidateQueries({ queryKey: ['rc_customer_info'] });
    },
    onError: (error: Error) => {
      console.log('[rc] Purchase error:', error.message);
      if (error.message.includes('cancelled') || error.message.includes('PURCHASE_CANCELLED')) {
        console.log('[rc] User cancelled purchase');
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!isConfigured) throw new Error('RevenueCat not configured');
      console.log('[rc] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      console.log('[rc] Restore result:', Object.keys(info.entitlements.active));
      return info;
    },
    onSuccess: (customerInfo) => {
      queryClient.setQueryData(['rc_customer_info'], customerInfo);
    },
  });

  const currentOffering = offeringsQuery.data?.current ?? null;
  const packages = currentOffering?.availablePackages ?? [];

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchase = useCallback(
    (pkg: PurchasesPackage) => purchaseAsync(pkg),
    [purchaseAsync]
  );

  const restore = useCallback(() => restoreAsync(), [restoreAsync]);

  return {
    isConfigured,
    isPremium,
    packages,
    currentOffering,
    isLoadingOfferings: offeringsQuery.isLoading,
    isLoadingCustomerInfo: customerInfoQuery.isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error?.message ?? null,
    restoreError: restoreMutation.error?.message ?? null,
    purchase,
    restore,
  };
});
