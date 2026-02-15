import axios from "axios";
import Cookies from "js-cookie";

class ReportGenerationsController {
  async addReportGeneration(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "ReportGenerations/AddReportGeneration",
        data
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async updateReportGeneration(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "ReportGenerations/UpdateReportGeneration",
        data
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getReportGeneration(id) {
    try {
      const res = await axios.get(
        `ReportGenerations/GetReportGeneration/${id}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getReportGenerations(routeId) {
    try {
      const res = await axios.get(
        `ReportGenerations/GetReportGenerations/${routeId}`
      );

      if (res.data.result) {
        return res.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
export default new ReportGenerationsController();
