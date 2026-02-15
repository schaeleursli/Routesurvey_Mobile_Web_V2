import axios from "axios";
import Cookies from "js-cookie";

class AccountRequestsController {
  async addAccountRequest(data) {
    try {
      console.log(
        "AccountRequestsController.addAccountRequest called with data:",
        data
      );
      const res = await axios.post("AccountRequests/AddAccountRequest", data);
      console.log(
        "AccountRequestsController.addAccountRequest response:",
        res.data
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
        };
      }
    } catch (error) {
      console.log("AccountRequestsController.addAccountRequest error:", error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async updateAccountRequest(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "AccountRequests/UpdateAccountRequest",
        data
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

  async updateAccountRequestStatus(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "AccountRequests/UpdateAccountRequestStatus",
        data
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

  async deleteAccountRequest(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `AccountRequests/DeleteAccountRequest/${id}/${uid}`
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

  async getAccountRequest(id) {
    try {
      const res = await axios.get(`AccountRequests/GetAccountRequest/${id}`);

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

  async getAccountRequests() {
    try {
      const res = await axios.get("AccountRequests/GetAccountRequests");

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

  async getAccountRequestsPaginated(pageNumber, pageSize, search) {
    try {
      const params = new URLSearchParams({
        pageNumber: pageNumber,
        pageSize: pageSize,
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const res = await axios.get(
        `AccountRequests/GetAccountRequestsPaginated?${params.toString()}`
      );

      // console.log(res.data);

      if (res.data.success) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
          totalCount: res.data.totalCount,
          pageNumber: res.data.pageNumber,
          pageSize: res.data.pageSize,
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

  async getArchivedAccountRequests() {
    try {
      const res = await axios.get("AccountRequests/GetArchivedAccountRequests");

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

  async getArchivedAccountRequestsPaginated(pageNumber, pageSize, search) {
    try {
      const params = new URLSearchParams({
        pageNumber: pageNumber,
        pageSize: pageSize,
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const res = await axios.get(
        `AccountRequests/GetArchivedAccountRequestsPaginated?${params.toString()}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
          totalCount: res.data.totalCount,
          pageNumber: res.data.pageNumber,
          pageSize: res.data.pageSize,
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

  async archiveAccountRequest(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `AccountRequests/ArchiveAccountRequest/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          // data: res.data.data,
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

  async unarchiveAccountRequest(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `AccountRequests/UnarchiveAccountRequest/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          // data: res.data.data,
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

export default new AccountRequestsController();
