import axios from "axios";
import Cookies from "js-cookie";

class NotificationsController {
  async sendSingleNotification(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.actionBy = uid;

      const res = await axios.post(
        "Notifications/SendSingleNotification",
        data
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

  async sendMultiNotification(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.actionBy = uid;

      const res = await axios.post("Notifications/SendMultiNotification", data);

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

  async getNotificationsForUser(userId) {
    try {
      const res = await axios.get(
        `Notifications/GetNotificationsForUser/${userId}`
      );

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
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
        data: [],
      };
    }
  }

  async getCurrentUserNotifications() {
    try {
      const userId = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `Notifications/GetNotificationsForUser/${userId}`
      );

      //   console.log(res.data.data);

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
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
        data: [],
      };
    }
  }

  async logNotification(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.actionBy = uid;

      const res = await axios.post("Notifications/LogNotification", data);

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
}

export default new NotificationsController();
