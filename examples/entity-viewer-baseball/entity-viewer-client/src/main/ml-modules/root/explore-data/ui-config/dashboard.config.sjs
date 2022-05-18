const dashboardConfig = {
  // Dashboard view
  dashboard: {
    metrics: {
      component: "Metrics",
      config: {
        items: [
          {
            title: "New entities this week",
            type: "entities",
            path: "entities",
            period: 10080,
            color: "#70d8c1",
          },
          {
            title: "Sources added this week",
            type: "sources",
            path: "sources",
            period: 10080,
            color: "#f5d881",
          },
          {
            title: "Tasks created today",
            type: "tasks",
            path: "tasks",
            period: 1440,
            color: "#ffbd8e",
          },
          {
            title: "Activities unassigned",
            type: "activities",
            path: "activities",
            period: 0,
            color: "#ff984e",
          },
        ],
      },
    },

    recentSearches: {
      component: "RecentSearches",
      maxEntries: 100,
      maxTime: 1440,
      config: {
        cols: [
          {
            title: "Search Criteria",
            type: "query",
          },
          {
            title: "Copy & Share",
            type: "icon",
          },
        ],
      },
    },

    whatsNew: {
      component: "WhatsNew",
      config: {
        items: [
          {
            label: "New",
            type: "new",
            path: "new",
            color: "#3CDBC0",
          },
          {
            label: "Changed",
            type: "changed",
            path: "changed",
            color: "#09ABDE",
          },
          {
            label: "Submitted",
            type: "submitted",
            path: "submitted",
            color: "#09EFEF",
          },
        ],
        menu: [
          {
            label: "Today",
            period: 1440,
          },
          {
            label: "This Week",
            period: 10080,
            default: true,
          },
          {
            label: "This Month",
            period: 43200,
          },
        ],
      },
    },

    recentRecords: {
      component: "RecentRecords",
      maxEntries: 100,
      maxTime: 1440,
      config: {
        entities: {
          team: {
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "team.images.image",
                path: "url",
                alt: "recent thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "name",
              path: "team.fullname",
            },
            items: [
              {
                component: "Value",
                config: {
                  path: "team.location.city",
                },
              },
              {
                component: "Value",
                config: {
                  path: "team.location.state",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "capacity: ",
                  path: "team.season-details.venue.season-details.capacity",
                },
              },
            ],
          },
          player: {
            thumbnail: {
              component: "Image",
              config: {
                arrayPath: "player.images.image",
                path: "url",
                alt: "recent thumbnail",
                style: {
                  width: "70px",
                  height: "70px",
                },
              },
            },
            title: {
              id: "name",
              path: "player.fullname",
            },
            items: [
              {
                component: "Value",
                config: {
                  prefix: "dorsal:",
                  path: "player.season-details.number",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "height:",
                  path: "player.height.#text",
                },
              },
              {
                component: "Value",
                config: {
                  prefix: "weight:",
                  path: "player.weight.#text",
                },
              },
            ],
          },
          event: {
            title: {
              id: "name",
              path: "event.attacktype1_txt",
            },
            items: [
              {
                component: "Address",
                config: {
                  arrayPath: "event",
                  city: "city",
                  country: "country_txt",
                  state: "region_txt",
                  style: {
                    width: "350px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              },
              {
                component: "Value",
                config: {
                  path: "event.weaptype1_txt",
                },
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = dashboardConfig;
