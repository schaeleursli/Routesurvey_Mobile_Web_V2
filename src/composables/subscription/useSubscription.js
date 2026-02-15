import { ref, inject } from "vue";
import SubscriptionPlansController from "@/controllers/subscription_plans/subscription_plans_controller";
import { useAuthStore } from '@/stores/auth';

export const useSubscription = () => {

  const showMessage = inject("showMessage", () => { });
  const subscription = ref(null);
  const planData = ref(null);
  const isTrailExpired = ref(false);
  const remainingDays = ref(0);
  const expireDate = ref(null);

  const authStore = useAuthStore();

  const checkUserTrailExpired = async () => {
    // If store already has this data, we might want to use it, 
    // but for now let's just use the store action if available or keep controller usage via store?
    // Store doesn't seem to have checkUserTrailExpired action yet. We should add it to store.

    // For now, let's call the store to handle this logic if we add it, 
    // OR we can leave it here but access via store instance if we move logic there.

    // BUT since I can't see the Store having this action yet, I will add it to the Store first?
    // Actually, let's add it to the Store in this same step if possible? No, I need to edit useSubscription.js.

    // Ideally: const res = await authStore.checkTrailStatus();
    // I will implementation this in the store next.
    const res = await authStore.checkUserTrailExpired();
    if (res.result) {
      isTrailExpired.value = res.data;
      remainingDays.value = res.remainingDays;
      expireDate.value = res.expireDate;
    }
  };

  const checkFeatureAccess = (feature) => {
    if (planData.value) {
      if (planData.value.name === "Core") {
        if (planData.value.features[feature]) {
          return true;
        } else {
          return false;
        }
      } else {
        return planData.value.features.includes(feature);
      }
    } else {
      return !isTrailExpired.value;
    }
  };

  const getSubscription = async () => {
    try {
      const res = await SubscriptionPlansController.getActiveSubscription();

      if (res.result) {
        subscription.value = res.data;
        planData.value = JSON.parse(subscription.value.planData);
        // console.log(planData.value);
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async () => {
    // setGlobalLoading(true);

    try {
      // await getSubscription();
      // await checkUserTrailExpired();
      await Promise.all([checkUserTrailExpired(), getSubscription()]);
    } catch (error) {
      showMessage({ status: "error", message: error });
    }

    // setGlobalLoading(false);
  };

  return {
    subscription,
    isTrailExpired,
    remainingDays,
    expireDate,
    getData,
    checkFeatureAccess,
    checkUserTrailExpired,
  };
};
