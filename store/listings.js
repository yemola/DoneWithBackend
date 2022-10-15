const listings = [
  {
    id: 201,
    title: "Red jacket",
    images: [{ fileName: "jacket1" }],
    price: 100,
    categoryId: 5,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 3,
    title: "Gray couch in a great condition",
    images: [{ fileName: "couch2" }],
    categoryId: 1,
    price: 1200,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 1,
    title: "Room & Board couch (great condition) - delivery included",
    description:
      "I'm selling my furniture at a discount price. Pick up at Venice. DM me asap.",
    images: [
      { fileName: "couch1" },
      { fileName: "couch2" },
      { fileName: "couch3" },
    ],
    price: 1000,
    categoryId: 1,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 2,
    title: "Designer wear shoes",
    images: [{ fileName: "shoes1" }],
    categoryId: 5,
    price: 100,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 102,
    title: "Canon 400D (Great Condition)",
    images: [{ fileName: "camera1" }],
    price: 300,
    categoryId: 3,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 101,
    title: "Nikon D850 for sale",
    images: [{ fileName: "camera2" }],
    price: 350,
    categoryId: 3,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 4,
    title: "Sectional couch - Delivery available",
    description: "No rips no stains no odors",
    images: [{ fileName: "couch3" }],
    categoryId: 1,
    price: 950,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 6,
    title: "Brown leather shoes",
    images: [{ fileName: "shoes2" }],
    categoryId: 5,
    price: 50,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
];

const addListing = (listing) => {
  listing.id = listings.length + 1;
  listings.push(listing);
};

const getListings = () => listings;

const getListing = (id) => listings.find((listing) => listing.id === id);

const filterListings = (predicate) => listings.filter(predicate);

module.exports = {
  addListing,
  getListings,
  getListing,
  filterListings,
};

[
  {
    id: 201,
    title: "Red jacket",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/jacket1_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/jacket1_thumb.jpg",
      },
    ],
    price: 100,
    categoryId: 5,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 3,
    title: "Gray couch in a great condition",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/couch2_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/couch2_thumb.jpg",
      },
    ],
    categoryId: 1,
    price: 1200,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 1,
    title: "Room & Board couch (great condition) - delivery included",
    description:
      "I'm selling my furniture at a discount price. Pick up at Venice. DM me asap.",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/couch1_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/couch1_thumb.jpg",
      },
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/couch2_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/couch2_thumb.jpg",
      },
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/couch3_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/couch3_thumb.jpg",
      },
    ],
    price: 1000,
    categoryId: 1,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 2,
    title: "Designer wear shoes",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/shoes1_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/shoes1_thumb.jpg",
      },
    ],
    categoryId: 5,
    price: 100,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 102,
    title: "Canon 400D (Great Condition)",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/camera1_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/camera1_thumb.jpg",
      },
    ],
    price: 300,
    categoryId: 3,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 101,
    title: "Nikon D850 for sale",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/camera2_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/camera2_thumb.jpg",
      },
    ],
    price: 350,
    categoryId: 3,
    userId: 1,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 4,
    title: "Sectional couch - Delivery available",
    description: "No rips no stains no odors",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/couch3_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/couch3_thumb.jpg",
      },
    ],
    categoryId: 1,
    price: 950,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
  {
    id: 6,
    title: "Brown leather shoes",
    images: [
      {
        url: "https://donebucket1.s3.eu-central-1.amazonaws.com/shoes2_full.jpg",
        thumbnailUrl:
          "https://donebucket1.s3.eu-central-1.amazonaws.com/shoes2_thumb.jpg",
      },
    ],
    categoryId: 5,
    price: 50,
    userId: 2,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
  },
];
