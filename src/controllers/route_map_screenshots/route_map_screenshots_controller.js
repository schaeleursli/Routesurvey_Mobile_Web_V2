import axios from "axios";
import Cookies from "js-cookie";

class RouteMapScreenshotsController {
  // data = {
  //   RouteId: 1,
  //   Screenshot: JSON.stringify({
  //     Url: "url-of-screenshot",
  //     Type: "photo",
  //     Note: "Notes",
  //   }),
  //   ExtraData: "",
  // };
  async addRouteMapScreenshot(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data = {
        ...data,
        ActionBy: uid,
      };

      const res = await axios.post(
        "Route/MapScreenshots/AddMapScreenshot",
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
        message: "Failed to add route map screenshot",
      };
    }
  }

  async getMapScreenshotsByRouteId(routeId) {
    try {
      const res = await axios.get(
        `Route/MapScreenshots/GetMapScreenshotsByRouteId/${routeId}`
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
        message: "Failed to get map screenshots by route id",
      };
    }
  }

  async getMapScreenshot(id) {
    try {
      const res = await axios.get(
        `Route/MapScreenshots/GetMapScreenshot/${id}`
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
        message: "Failed to get map screenshot",
      };
    }
  }

  async deleteMapScreenshot(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.delete(
        `Route/MapScreenshots/DeleteMapScreenshot/${id}/${uid}`
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
        message: "Failed to delete map screenshot",
      };
    }
  }

  async archiveMapScreenshot(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `Route/MapScreenshots/ArchiveMapScreenshot/${id}/${uid}`
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
        message: "Failed to archive map screenshot",
      };
    }
  }

  async unarchiveMapScreenshot(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `Route/MapScreenshots/UnarchiveMapScreenshot/${id}/${uid}`
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
        message: "Failed to unarchive map screenshot",
      };
    }
  }

  // data = {
  //   ScreenshotOrders: [
  //     { Id: 1, Order: 1 },
  //     { Id: 2, Order: 2 },
  //     ...
  //   ]
  // };
  async updateMapScreenshotOrder(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data = {
        ...data,
        ActionBy: uid,
      };

      const res = await axios.post(
        "Route/MapScreenshots/UpdateMapScreenshotOrder",
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
        message: "Failed to update map screenshot order",
      };
    }
  }

  // data = {
  //   Id: screenshotId,
  //   Screenshot: JSON.stringify({
  //     Url: "url-of-screenshot",
  //     Type: "photo",
  //     Note: "Notes",
  //   }),
  //   ExtraData: "",
  //   Order: orderValue,
  // };
  async updateMapScreenshot(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data = {
        ...data,
        ActionBy: uid,
      };

      const res = await axios.put(
        "Route/MapScreenshots/UpdateMapScreenshot",
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
        message: "Failed to update map screenshot",
      };
    }
  }
}

export default new RouteMapScreenshotsController();
