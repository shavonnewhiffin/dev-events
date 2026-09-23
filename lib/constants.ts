export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "Next.js Conf 2026",
    image: "/images/event1.png",
    slug: "nextjs-conf-2026",
    location: "San Francisco, CA, USA",
    date: "October 22, 2026",
    time: "09:00 AM",
  },
  {
    title: "GitHub Universe 2026",
    image: "/images/event2.png",
    slug: "github-universe-2026",
    location: "San Francisco, CA, USA",
    date: "October 28, 2026",
    time: "09:30 AM",
  },
  {
    title: "Devoxx Belgium 2026",
    image: "/images/event3.png",
    slug: "devoxx-belgium-2026",
    location: "Antwerp, Belgium",
    date: "October 5, 2026",
    time: "09:00 AM",
  },
  {
    title: "Web Summit 2026",
    image: "/images/event4.png",
    slug: "web-summit-2026",
    location: "Lisbon, Portugal",
    date: "November 9, 2026",
    time: "10:00 AM",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event5.png",
    slug: "kubecon-cloudnativecon-na-2026",
    location: "Salt Lake City, UT, USA",
    date: "November 9, 2026",
    time: "09:00 AM",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event6.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV, USA",
    date: "November 30, 2026",
    time: "08:00 AM",
  },
];
