import axios from "axios";
import Cookies from "js-cookie";

class PlannedRoutesController {
  async addPlannedRoute(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post("PlannedRoutes/AddPlannedRoute", {
        Data: JSON.stringify(data),
        UserId: uid,
        ActionBy: uid,
      });

      //   console.log(res);

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
        message: "Failed to add planned route",
      };
    }
  }

  async updatePlannedRoute(id, data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post("PlannedRoutes/UpdatePlannedRoute", {
        Id: id,
        Data: JSON.stringify(data),
        UserId: uid,
        ActionBy: uid,
      });

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
        message: "Failed to update planned route",
      };
    }
  }

  async deletePlannedRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `PlannedRoutes/DeletePlannedRoute/${id}/${uid}`
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

  async archivePlannedRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `PlannedRoutes/ArchivePlannedRoute/${id}/${uid}`
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

  async unarchivePlannedRoute(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `PlannedRoutes/UnarchivePlannedRoute/${id}/${uid}`
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

  async getPlannedRoutes() {
    try {
      const res = await axios.get("PlannedRoutes/GetPlannedRoutes");

      if (res.data.result) {
        // return res.data.data;
        return res.data.data.map((route) => {
          const parsedData = JSON.parse(route.data);
          return {
            ...route,
            ...parsedData,
          };
        });
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getArchivedPlannedRoutes() {
    try {
      const res = await axios.get("PlannedRoutes/GetArchivedPlannedRoutes");

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

  async getPlannedRoute(id) {
    try {
      const res = await axios.get(`PlannedRoutes/GetPlannedRoute/${id}`);

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

  async getCurrentUserPlannedRoutes() {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`PlannedRoutes/GetUserPlannedRoutes/${uid}`);

      if (res.data.result) {
        return res.data.data.map((route) => {
          const parsedData = JSON.parse(route.data);
          return {
            ...route,
            ...parsedData,
          };
        });
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async updateRouteData(routeId, data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post("PlannedRoutes/UpdateRouteData", {
        RouteId: routeId,
        Data: JSON.stringify(data),
        ActionBy: uid,
      });

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

  async getRouteData(routeId) {
    try {
      const res = await axios.get(`PlannedRoutes/GetRouteData/${routeId}`);

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

export default new PlannedRoutesController();
