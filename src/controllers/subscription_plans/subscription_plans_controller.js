import axios from "axios";
import Cookies from "js-cookie";

class SubscriptionPlansController {
  async addSubscriptionPlan(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Subscription/AddSubscriptionPlan", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async updateSubscriptionPlan(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Subscription/UpdateSubscriptionPlan", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async removeSubscriptionPlan(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `Subscription/RemoveSubscriptionPlan/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getSubscriptionPlan(id) {
    try {
      const res = await axios.get(`Subscription/GetSubscriptionPlan/${id}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getSubscriptionPlans() {
    try {
      const res = await axios.get("Subscription/GetSubscriptionPlans");

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async createSubscription(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;
      data.CustomerId = String(uid);

      const res = await axios.post("Stripe/CreateSubscription", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async cancelSubscription() {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Stripe/CancelSubscription/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async createPaymentIntent(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const requestData = {
        ...data,
        UserId: uid,
        ActionBy: uid,
      };

      const res = await axios.post("Stripe/CreatePaymentIntent", requestData);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          // data: res.data.data,
          clientSecret: res.data.clientSecret,
          publishableKey: res.data.publishableKey,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  // async subscribeToPlan(data) {
  //   try {
  //     const uid = Number(Cookies.get("login_user_id"));

  //     data.UserId = uid;
  //     data.ActionBy = uid;

  //     const res = await axios.post("Subscription/SubscribeToPlan", data);

  //     if (res.data.result) {
  //       return {
  //         result: true,
  //         message: String(res.data.message),
  //       };
  //     } else {
  //       return {
  //         result: false,
  //         message: String(res.data.message),
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       result: false,
  //       message: String(error),
  //     };
  //   }
  // }

  // async unsubscribeFromPlan() {
  //   try {
  //     const uid = Number(Cookies.get("login_user_id"));

  //     // data.UserId = uid;
  //     // data.ActionBy = uid;

  //     const res = await axios.post("Subscription/UnsubscribeFromPlan", {
  //       UserId: uid,
  //       ActionBy: uid,
  //     });

  //     if (res.data.result) {
  //       return {
  //         result: true,
  //         message: String(res.data.message),
  //       };
  //     } else {
  //       return {
  //         result: false,
  //         message: String(res.data.message),
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       result: false,
  //       message: String(error),
  //     };
  //   }
  // }

  async getSubscriptions() {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Subscription/GetSubscriptions/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getActiveSubscription() {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Subscription/GetActiveSubscription/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
          stripeData: res.data.stripeData,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getUserActiveSubscription(userId) {
    try {
      const res = await axios.get(
        `Subscription/GetActiveSubscription/${userId}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
          stripeData: res.data.stripeData,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }
}

export default new SubscriptionPlansController();
