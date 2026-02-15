import axios from "axios";
import Cookies from "js-cookie";
import { normalizeRouteData } from "@/utils/routeDataNormalizer";

class RoutesController {
  _normalizeRouteList(routes) {
    if (!Array.isArray(routes)) return [];
    return routes.map((route) => normalizeRouteData(route));
  }

  async addRoute(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.UserId = uid;
      data.ActionBy = uid;

      const res = await axios.post("Routes/AddRoute", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: normalizeRouteData(res.data.data),
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

  async updateRoute(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Routes/UpdateRoute", data);

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

  async removeRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Routes/RemoveRoute/${id}/${uid}`);

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

  async archiveRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Routes/ArchiveRoute/${id}/${uid}`);

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

  async unarchiveRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Routes/UnarchiveRoute/${id}/${uid}`);

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

  async getRoute(id) {
    try {
      const res = await axios.get(`Routes/GetRoute/${id}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: normalizeRouteData(res.data.data),
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

  async getUserRoutes(userId) {
    try {
      const res = await axios.get(`Routes/GetUserRoutes/${userId}`);

      if (res.data.result) {
        return this._normalizeRouteList(res.data.data);
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getCurrentUserRoutes() {
    try {
      const userId = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Routes/GetUserRoutes/${userId}`);

      if (res.data.result) {
        return this._normalizeRouteList(res.data.data);
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getCurrentUserRoutesPaginated(page, pageSize) {
    try {
      const res = await axios.post(`Routes/GetUserRoutesPaginated`, {
        UserId: Number(Cookies.get("login_user_id")),
        PageNumber: page,
        PageSize: pageSize,
      });

      if (res.data.result) {
        return {
          result: true,
          data: this._normalizeRouteList(res.data.data),
          pagination: res.data.pagination,
          // pagination: {
          //   currentPage: res.data.pagination.CurrentPage,
          //   pageSize: res.data.pagination.PageSize,
          //   totalCount: res.data.pagination.TotalCount,
          //   totalPages: res.data.pagination.TotalPages,
          //   hasPreviousPage: res.data.pagination.HasPreviousPage,
          //   hasNextPage: res.data.pagination.HasNextPage,
          //   previousPageNumber: res.data.pagination.PreviousPageNumber,
          //   nextPageNumber: res.data.pagination.NextPageNumber,
          // }
        };
      } else {
        return {
          result: false,
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        data: [],
      };
    }
  }

  async getUserArchivedRoutes(userId) {
    try {
      const res = await axios.get(`Routes/GetUserArchivedRoutes/${userId}`);

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

  async getCurrentUserArchivedRoutes() {
    try {
      const userId = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Routes/GetUserArchivedRoutes/${userId}`);

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

  async getRouteReportData(routeId) {
    try {
      const res = await axios.get(`Routes/GetRouteReportData/${routeId}`);

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

  async updateRouteReportData(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Routes/UpdateRouteReportData", data);

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

  async searchRoutes(search, limit = 15) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post(`Routes/SearchRoutes`, {
        UserId: uid,
        Query: String(search),
        Limit: Number(limit),
      });

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
}

export default new RoutesController();
