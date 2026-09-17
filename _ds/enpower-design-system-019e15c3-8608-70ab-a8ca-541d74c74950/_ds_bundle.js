/* @ds-bundle: {"format":3,"namespace":"ENpowerDesignSystem_019e15","components":[],"sourceHashes":{"ui_kits/website/Components.jsx":"889b7bdd2843","ui_kits/website/Components.v1.jsx":"fe240805d169","ui_kits/website/gsap-anim.js":"1543632b38ab","ui_kits/website/scroll-anim.js":"a9539ace579d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ENpowerDesignSystem_019e15 = window.ENpowerDesignSystem_019e15 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/website/Components.jsx
try { (() => {
// ENpower Website — v2 components (editorial)
const {
  useState
} = React;
const Announce = () => /*#__PURE__*/React.createElement("div", {
  className: "announce"
}, /*#__PURE__*/React.createElement("span", {
  className: "pill"
}, "LIVE"), /*#__PURE__*/React.createElement("span", null, "Applications open for the 2026 Future Creators cohort \u2014 7,400 students nationwide."), /*#__PURE__*/React.createElement("span", {
  className: "sep"
}), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Apply now \u2192"));
const Nav = ({
  active = 'home',
  onNav
}) => /*#__PURE__*/React.createElement("nav", {
  className: "nav"
}, /*#__PURE__*/React.createElement("a", {
  className: "nav-logo",
  href: "#",
  onClick: e => e.preventDefault()
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/ENP-logo.png",
  alt: "ENpower"
})), /*#__PURE__*/React.createElement("ul", {
  className: "nav-links"
}, [{
  l: 'Home'
}, {
  l: 'Programs',
  chev: true
}, {
  l: 'For Schools'
}, {
  l: 'For Educators'
}, {
  l: 'IFT',
  tag: 'NEW'
}, {
  l: 'Impact'
}, {
  l: 'About'
}].map(({
  l,
  chev,
  tag
}) => /*#__PURE__*/React.createElement("li", {
  key: l
}, /*#__PURE__*/React.createElement("a", {
  className: active === l.toLowerCase() ? 'on' : '',
  onClick: e => {
    e.preventDefault();
    onNav && onNav(l);
  }
}, l, tag && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: '.55rem',
    background: '#E5A817',
    color: '#1a1325',
    padding: '.1rem .35rem',
    borderRadius: '999px',
    fontWeight: 700,
    letterSpacing: '.05em',
    marginLeft: '.15rem'
  }
}, tag), chev && /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "expand_more"))))), /*#__PURE__*/React.createElement("div", {
  className: "nav-cta"
}, /*#__PURE__*/React.createElement("button", {
  className: "nav-search",
  "aria-label": "Search"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "search")), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost"
}, "School Login"), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-primary"
}, "Partner with us ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))));
const Hero = () => /*#__PURE__*/React.createElement("section", {
  className: "hero"
}, /*#__PURE__*/React.createElement("div", {
  className: "bg-grid"
}), /*#__PURE__*/React.createElement("div", {
  className: "bg-beams"
}), /*#__PURE__*/React.createElement("div", {
  className: "wrap",
  style: {
    position: 'relative',
    zIndex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "hero-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "hero-text"
}, /*#__PURE__*/React.createElement("span", {
  className: "hero-mark",
  "data-anim": "up-sm"
}, /*#__PURE__*/React.createElement("span", {
  className: "sparkle"
}, "\u2726"), /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "EST 2015 \xB7 TATA ClassEdge Alliance"), /*#__PURE__*/React.createElement("h1", {
  className: "hero-h",
  "data-anim": "up",
  "data-delay": "0.1"
}, /*#__PURE__*/React.createElement("span", {
  className: "row1"
}, "Nurturing"), /*#__PURE__*/React.createElement("span", {
  className: "row2"
}, /*#__PURE__*/React.createElement("span", null, "a"), /*#__PURE__*/React.createElement("span", {
  className: "hero-cap wide tilt"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/aryan-singh.png",
  alt: ""
})), /*#__PURE__*/React.createElement("em", null, "generation")), /*#__PURE__*/React.createElement("span", {
  className: "row3"
}, /*#__PURE__*/React.createElement("span", null, "of"), /*#__PURE__*/React.createElement("span", {
  className: "hero-cap x-wide tilt-r"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/article.jpg",
  alt: ""
})), /*#__PURE__*/React.createElement("span", {
  className: "underline"
}, "Future Creators."))), /*#__PURE__*/React.createElement("p", {
  className: "hero-sub",
  "data-anim": "up",
  "data-delay": "0.25"
}, "India's first integrated future-skills ecosystem for K-12 schools. We help children ", /*#__PURE__*/React.createElement("b", null, "Think, Create and Lead"), " \u2014 with hands-on labs, entrepreneurship programs and a national stage to showcase their work."), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions",
  "data-anim": "up",
  "data-delay": "0.35"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-primary btn-lg",
  "data-magnetic": true
}, "Explore partnership ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward")), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost btn-lg",
  "data-magnetic": true
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "play_circle"), " Watch our story \xB7 2:14")), /*#__PURE__*/React.createElement("div", {
  className: "hero-stats",
  "data-stagger": true,
  "data-stagger-step": "0.08",
  "data-stagger-base": "0.45"
}, /*#__PURE__*/React.createElement("div", {
  className: "hero-stat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, /*#__PURE__*/React.createElement("span", {
  "data-count": "750"
}, "0"), /*#__PURE__*/React.createElement("sup", null, "+")), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Partner schools")), /*#__PURE__*/React.createElement("div", {
  className: "divider",
  "data-anim": "fade",
  "data-stagger-item": true
}), /*#__PURE__*/React.createElement("div", {
  className: "hero-stat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, /*#__PURE__*/React.createElement("span", {
  "data-count": "200"
}, "0"), "K", /*#__PURE__*/React.createElement("sup", null, "+")), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Future leaders")), /*#__PURE__*/React.createElement("div", {
  className: "divider",
  "data-anim": "fade",
  "data-stagger-item": true
}), /*#__PURE__*/React.createElement("div", {
  className: "hero-stat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, /*#__PURE__*/React.createElement("span", {
  "data-count": "12"
}, "0"), /*#__PURE__*/React.createElement("sup", null, "+")), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "States \xB7 8 yrs")))), /*#__PURE__*/React.createElement("div", {
  className: "hero-collage",
  "data-parallax": "-0.05"
}, /*#__PURE__*/React.createElement("span", {
  className: "sparkle-deco sparkle-1"
}), /*#__PURE__*/React.createElement("span", {
  className: "sparkle-deco sparkle-2"
}), /*#__PURE__*/React.createElement("span", {
  className: "sparkle-deco sparkle-3"
}), /*#__PURE__*/React.createElement("div", {
  className: "blob"
}), /*#__PURE__*/React.createElement("div", {
  className: "frame f-1",
  "data-anim": "rot-l",
  "data-delay": "0.2"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/hero2.png",
  alt: ""
})), /*#__PURE__*/React.createElement("div", {
  className: "frame f-2",
  "data-anim": "rot-r",
  "data-delay": "0.4"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/article.jpg",
  alt: ""
})), /*#__PURE__*/React.createElement("div", {
  className: "frame f-3",
  "data-anim": "rot-l",
  "data-delay": "0.6"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/impact-program/students.jpg",
  alt: ""
})), /*#__PURE__*/React.createElement("div", {
  className: "sticker s-rating",
  "data-anim": "scale",
  "data-delay": "0.85"
}, /*#__PURE__*/React.createElement("span", {
  className: "stars"
}, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("span", null, "4.9 / 5 \xB7 1,800 educators")), /*#__PURE__*/React.createElement("div", {
  className: "sticker s-award",
  "data-anim": "scale",
  "data-delay": "1.05"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "emoji_events"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
  style: {
    fontFamily: 'Space Grotesk',
    color: '#1a1325'
  }
}, "NEP 2020"), " \xB7 Future-skills aligned"))))));
const Cred = () => {
  const items = [{
    t: 'Aligned with NEP 2020',
    s: true
  }, {
    t: 'OECD Future of Education'
  }, {
    t: 'WEF Future of Jobs'
  }, {
    t: 'NFTE Entrepreneurship Curriculum'
  }, {
    t: 'UNICEF YuWaah Partner'
  }, {
    t: 'Atal Marathon 2025'
  }, {
    t: 'INSPIRE MANAK'
  }, {
    t: 'TATA ClassEdge Alliance'
  }];
  const loop = [...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    className: "cred",
    "aria-label": "Aligned with national and global frameworks"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cred-track"
  }, loop.map((it, i) => /*#__PURE__*/React.createElement("span", {
    className: "cred-item",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "sparkle"
  }, "\u2726"), /*#__PURE__*/React.createElement("b", null, it.t)))));
};
const Mission = () => /*#__PURE__*/React.createElement("section", {
  className: "mission"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "mission-head"
}, /*#__PURE__*/React.createElement("div", {
  "data-anim": "up"
}, /*#__PURE__*/React.createElement("span", {
  className: "kicker"
}, "Our Philosophy"), /*#__PURE__*/React.createElement("h2", {
  className: "display section-title"
}, "Three verbs.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "One generation"), " of Indian creators.")), /*#__PURE__*/React.createElement("p", {
  className: "lede",
  style: {
    maxWidth: '42ch'
  },
  "data-anim": "up",
  "data-delay": "0.15"
}, "ENpower's curriculum is built around a simple, exacting promise \u2014 by the time a student leaves our program, they can Think clearly, Create boldly and Lead with empathy.")), /*#__PURE__*/React.createElement("div", {
  className: "mission-grid",
  "data-stagger": true,
  "data-stagger-step": "0.12"
}, /*#__PURE__*/React.createElement("div", {
  className: "mission-card",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "verb"
}, "Think. ", /*#__PURE__*/React.createElement("span", {
  className: "num"
}, "01")), /*#__PURE__*/React.createElement("h4", null, "Foundation literacy & problem-solving"), /*#__PURE__*/React.createElement("p", null, "Critical reasoning, data fluency and structured-thinking frameworks that scaffold every other future skill \u2014 across grades 6 to 12."), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("b", null, "17"), /*#__PURE__*/React.createElement("span", null, "future skills mapped"))), /*#__PURE__*/React.createElement("div", {
  className: "mission-card",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "verb"
}, "Create. ", /*#__PURE__*/React.createElement("span", {
  className: "num"
}, "02")), /*#__PURE__*/React.createElement("h4", null, "Hands-on building & design"), /*#__PURE__*/React.createElement("p", null, "Tech Innovation Lab and Creative Studio Lab give students real prototyping time with AI, robotics, electronics, and design thinking."), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("b", null, "48\u201372"), /*#__PURE__*/React.createElement("span", null, "lab hours per year"))), /*#__PURE__*/React.createElement("div", {
  className: "mission-card",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "verb"
}, "Lead. ", /*#__PURE__*/React.createElement("span", {
  className: "num"
}, "03")), /*#__PURE__*/React.createElement("h4", null, "Entrepreneurial confidence"), /*#__PURE__*/React.createElement("p", null, "India's Future Tycoons \u2014 the national entrepreneurship stage \u2014 turns student ideas into pitches, partnerships and recognition."), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("b", null, "2,400+"), /*#__PURE__*/React.createElement("span", null, "pitches mentored"))))));
const Engagements = () => /*#__PURE__*/React.createElement("section", {
  className: "section"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head",
  "data-anim": "up"
}, /*#__PURE__*/React.createElement("span", {
  className: "kicker"
}, "Engagements"), /*#__PURE__*/React.createElement("h2", {
  className: "display section-title"
}, "An ", /*#__PURE__*/React.createElement("em", null, "end-to-end ecosystem"), " for forward-looking schools."), /*#__PURE__*/React.createElement("p", {
  className: "lede",
  style: {
    marginTop: '1rem'
  }
}, "Five interlocking programs \u2014 labs, training and recognition \u2014 that meet every learner and every educator where they are.")), /*#__PURE__*/React.createElement("div", {
  className: "eng-grid",
  "data-stagger": true,
  "data-stagger-step": "0.1"
}, /*#__PURE__*/React.createElement("article", {
  className: "eng-card feat border-beam spotlight",
  "data-spotlight": true,
  "data-anim": "scale-up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("img", {
  className: "bg",
  src: "../../assets/home/FSL.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "ov"
}), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Grades 6\u201312 \xB7 Flagship"), /*#__PURE__*/React.createElement("div", {
  className: "body"
}, /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "India's First"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "bottom"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Future Skills Lab"), /*#__PURE__*/React.createElement("p", null, "A 5-year curriculum that weaves entrepreneurship, AI literacy and 21st-century human skills into a single integrated lab experience.")), /*#__PURE__*/React.createElement("div", {
  className: "arrow"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward")))))), /*#__PURE__*/React.createElement("article", {
  className: "eng-card tall spotlight",
  "data-spotlight": true,
  "data-anim": "scale-up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("img", {
  className: "bg",
  src: "../../assets/home/TIL.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "ov"
}), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "STEM \u2192 Innovation"), /*#__PURE__*/React.createElement("div", {
  className: "body"
}, /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "STEM"), /*#__PURE__*/React.createElement("div", {
  className: "bottom"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Tech Innovation Lab"), /*#__PURE__*/React.createElement("p", null, "AI, robotics, coding, smart systems. Where curiosity becomes prototypes.")), /*#__PURE__*/React.createElement("div", {
  className: "arrow"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))))), /*#__PURE__*/React.createElement("article", {
  className: "eng-card wide spotlight",
  "data-spotlight": true,
  "data-anim": "scale-up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("img", {
  className: "bg",
  src: "../../assets/home/CSL.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "ov"
}), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "CBSE compliant"), /*#__PURE__*/React.createElement("div", {
  className: "body"
}, /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "Creative"), /*#__PURE__*/React.createElement("div", {
  className: "bottom"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Composite Skills Lab"), /*#__PURE__*/React.createElement("p", null, "Kaushal Bodh + project-based skilling for the new CBSE framework.")), /*#__PURE__*/React.createElement("div", {
  className: "arrow"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))))), /*#__PURE__*/React.createElement("article", {
  className: "eng-card wide spotlight",
  "data-spotlight": true,
  "data-anim": "scale-up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("img", {
  className: "bg",
  src: "../../assets/home/TTA.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "ov"
}), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "For educators"), /*#__PURE__*/React.createElement("div", {
  className: "body"
}, /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "Academy"), /*#__PURE__*/React.createElement("div", {
  className: "bottom"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Training & Certification"), /*#__PURE__*/React.createElement("p", null, "Design-thinking and STEM certification for new-age teachers.")), /*#__PURE__*/React.createElement("div", {
  className: "arrow"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))))), /*#__PURE__*/React.createElement("article", {
  className: "eng-card wide spotlight",
  "data-spotlight": true,
  "data-anim": "scale-up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("img", {
  className: "bg",
  src: "../../assets/home/IP1.jpg",
  alt: ""
}), /*#__PURE__*/React.createElement("div", {
  className: "ov"
}), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "CSR & outreach"), /*#__PURE__*/React.createElement("div", {
  className: "body"
}, /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "Impact"), /*#__PURE__*/React.createElement("div", {
  className: "bottom"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Impact Programs"), /*#__PURE__*/React.createElement("p", null, "Reaching every child \u2014 ATL enhancement, livelihood, I.D.E.A Labs.")), /*#__PURE__*/React.createElement("div", {
  className: "arrow"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))))))));
const Footprint = () => {
  const stats = [{
    n: '12',
    sfx: '+',
    l: 'States · UTs',
    d: '+3 this year'
  }, {
    n: '750',
    sfx: '+',
    l: 'Partner schools',
    d: '+128 in FY25'
  }, {
    n: '200',
    sfx: 'K+',
    l: 'Future leaders',
    d: '+18% YoY'
  }, {
    n: '145',
    sfx: '+',
    l: 'Thinking coaches',
    d: 'Certified'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "footprint"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "map-bg",
    viewBox: "0 0 200 220",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M60 10 L90 12 L115 6 L135 18 L155 18 L165 35 L155 50 L165 70 L150 85 L150 105 L165 120 L155 140 L130 145 L115 165 L95 175 L80 195 L70 210 L55 200 L50 175 L60 155 L45 140 L35 115 L25 95 L30 70 L20 50 L35 35 L50 22 Z",
    fill: "#6c32a8"
  })), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      marginBottom: '2.5rem'
    },
    "data-anim": "up"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kicker"
  }, "The ENpower footprint"), /*#__PURE__*/React.createElement("h2", {
    className: "display section-title",
    style: {
      maxWidth: '24ch'
    }
  }, "Built across India.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "Trusted by"), " educators, parents & CSR partners.")), /*#__PURE__*/React.createElement("div", {
    className: "footprint-card",
    "data-anim": "up",
    "data-delay": "0.1"
  }, /*#__PURE__*/React.createElement("div", {
    "data-anim": "right",
    "data-delay": "0.25"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '.6rem',
      background: '#f5f0fa',
      color: '#6c32a8',
      padding: '.45rem .85rem',
      borderRadius: '999px',
      fontSize: '.74rem',
      fontWeight: 700,
      letterSpacing: '.12em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '16px'
    }
  }, "analytics"), "FY 2024\u201325 \xB7 Public report"), /*#__PURE__*/React.createElement("h3", {
    className: "display",
    style: {
      fontSize: '1.95rem',
      margin: '1rem 0 .6rem',
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("em", {
    style: {
      color: '#6c32a8',
      fontStyle: 'italic'
    }
  }, "67%"), " of the way to our 2030 goal:", /*#__PURE__*/React.createElement("br", null), "reach 1 crore future-ready learners."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#564b6f',
      fontSize: '.95rem',
      margin: 0
    }
  }, "Every metric below is independently audited and published in our annual Impact Disclosure."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem',
      maxWidth: '380px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '8px',
      background: '#ede8f9',
      borderRadius: '4px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: '67%',
      background: 'linear-gradient(90deg,#6c32a8 0%,#E5A817 100%)',
      borderRadius: '4px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '.5rem',
      fontSize: '.8rem',
      color: '#564b6f'
    }
  }, /*#__PURE__*/React.createElement("span", null, "2.4M learners reached"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#6c32a8'
    }
  }, "10M"), " by 2030")))), /*#__PURE__*/React.createElement("div", {
    className: "footprint-counters",
    "data-stagger": true,
    "data-stagger-step": "0.1",
    "data-stagger-base": "0.35"
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    className: "footprint-counter",
    key: s.l,
    "data-anim": "up",
    "data-stagger-item": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, /*#__PURE__*/React.createElement("span", {
    "data-count": s.n,
    "data-duration": "1800"
  }, "0"), /*#__PURE__*/React.createElement("span", {
    className: "suffix"
  }, s.sfx)), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, s.l), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "arrow_upward"), s.d)))))));
};
const Spotlight = () => /*#__PURE__*/React.createElement("section", {
  className: "spotlight"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head",
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    maxWidth: 'none',
    gap: '2rem'
  },
  "data-anim": "up"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "kicker"
}, "Innovator's Spotlight"), /*#__PURE__*/React.createElement("h2", {
  className: "display section-title",
  style: {
    maxWidth: '20ch'
  }
}, "Real students. ", /*#__PURE__*/React.createElement("em", null, "Real ideas"), ". Solving real problems.")), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost",
  style: {
    whiteSpace: 'nowrap'
  }
}, "See all stories ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))), /*#__PURE__*/React.createElement("div", {
  className: "spotlight-frame",
  "data-anim": "up",
  "data-delay": "0.1"
}, /*#__PURE__*/React.createElement("div", {
  className: "spotlight-photo",
  "data-anim": "left",
  "data-delay": "0.25"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/aryan-singh.png",
  alt: "Aryan Singh, Grade 12, Rajasthan"
}), /*#__PURE__*/React.createElement("div", {
  className: "name-plate"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Aryan Singh"), /*#__PURE__*/React.createElement("span", null, "Public School, Sikar \xB7 Rajasthan")), /*#__PURE__*/React.createElement("span", {
  className: "grade"
}, "Grade 12"))), /*#__PURE__*/React.createElement("div", {
  className: "spotlight-body",
  "data-anim": "right",
  "data-delay": "0.4"
}, /*#__PURE__*/React.createElement("span", {
  className: "tag"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined",
  style: {
    fontSize: '14px',
    color: '#E5A817'
  }
}, "auto_awesome"), "Featured \xB7 Agri-Tech & Social Impact"), /*#__PURE__*/React.createElement("h3", {
  className: "project-name"
}, "Mera Sathi Agrotech"), /*#__PURE__*/React.createElement("p", {
  className: "project-sub"
}, "A low-cost sensor kit that helps marginal farmers monitor soil health and water usage in real time \u2014 built and field-tested in seven villages."), /*#__PURE__*/React.createElement("blockquote", null, "Mera Sathi combines tech of the future with empathy and innovation \u2014 built for the farmers who shaped me."), /*#__PURE__*/React.createElement("div", {
  className: "meta-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "meta-cell"
}, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "National rank"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "Top 12 \xB7 IFT 2025")), /*#__PURE__*/React.createElement("div", {
  className: "meta-cell"
}, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "Mentor"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "IIT Bombay \xB7 DSAI")), /*#__PURE__*/React.createElement("div", {
  className: "meta-cell"
}, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "Funding"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "\u20B92.1L seed grant"))), /*#__PURE__*/React.createElement("div", {
  className: "actions"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-purple"
}, "Read full story ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward")), /*#__PURE__*/React.createElement("div", {
  className: "pagination"
}, /*#__PURE__*/React.createElement("button", {
  "aria-label": "Previous"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "chevron_left")), /*#__PURE__*/React.createElement("span", null, "01 / 24"), /*#__PURE__*/React.createElement("button", {
  "aria-label": "Next"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "chevron_right"))))))));
const Pillars = () => {
  const items = [{
    gif: '../../assets/icons/foundation-literacy.gif',
    n: 'PILLAR 01',
    t: 'Foundation Literacy',
    d: 'Reading, numeracy and digital basics that scaffold every other skill.'
  }, {
    gif: '../../assets/icons/future-competency.gif',
    n: 'PILLAR 02',
    t: 'Future Competency',
    d: 'Critical thinking, problem-solving and structured decision-making.'
  }, {
    gif: '../../assets/icons/human-skills.gif',
    n: 'PILLAR 03',
    t: 'Human Skills',
    d: 'Empathy, collaboration and communication for any team or stage.'
  }, {
    gif: '../../assets/icons/self-exploration.gif',
    n: 'PILLAR 04',
    t: 'Self Exploration',
    d: 'Identity, agency and personal goal-setting across the school journey.'
  }, {
    gif: '../../assets/icons/tech-of-the-future.gif',
    n: 'PILLAR 05',
    t: 'Tech of the Future',
    d: 'AI, robotics, design and the emerging tools shaping every career.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "pillars"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head center",
    "data-anim": "up"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kicker"
  }, "The 17 future skills"), /*#__PURE__*/React.createElement("h2", {
    className: "display section-title",
    style: {
      maxWidth: '24ch'
    }
  }, "Five focus areas that shape a ", /*#__PURE__*/React.createElement("em", null, "future creator"), "."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Our framework draws from NEP 2020, the OECD Learning Compass and WEF Future of Jobs \u2014 and translates them into Indian classrooms.")), /*#__PURE__*/React.createElement("div", {
    className: "pillar-grid",
    "data-stagger": true,
    "data-stagger-step": "0.09"
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    className: "pillar",
    key: it.t,
    "data-anim": "up",
    "data-stagger-item": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "arrow_forward")), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, it.n), /*#__PURE__*/React.createElement("div", {
    className: "icon"
  }, /*#__PURE__*/React.createElement("img", {
    src: it.gif,
    alt: ""
  })), /*#__PURE__*/React.createElement("h4", null, it.t), /*#__PURE__*/React.createElement("p", null, it.d))))));
};
const Educators = () => /*#__PURE__*/React.createElement("section", {
  className: "section"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "edu-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "edu-photo",
  "data-anim": "left"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/teacher building Capacity.png",
  alt: "ENpower educator training"
}), /*#__PURE__*/React.createElement("div", {
  className: "edu-stickers"
}, /*#__PURE__*/React.createElement("div", {
  className: "edu-sticker s1"
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "school")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, "3,200+"), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Educators certified"))), /*#__PURE__*/React.createElement("div", {
  className: "edu-sticker s2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "verified")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, "98%"), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Would recommend"))))), /*#__PURE__*/React.createElement("div", {
  "data-anim": "right",
  "data-delay": "0.15"
}, /*#__PURE__*/React.createElement("span", {
  className: "kicker"
}, "Empowering educators"), /*#__PURE__*/React.createElement("h2", {
  className: "display section-title"
}, "A new-age ", /*#__PURE__*/React.createElement("em", null, "certification"), " for the educators leading this evolution."), /*#__PURE__*/React.createElement("p", {
  className: "lede",
  style: {
    marginTop: '1rem'
  }
}, "We don't just hand schools a curriculum and leave. Our Thinking Coaches receive ongoing certification, lesson kits, and peer-to-peer mentoring across the school year."), /*#__PURE__*/React.createElement("div", {
  className: "edu-features",
  "data-stagger": true,
  "data-stagger-step": "0.08",
  "data-stagger-base": "0.25"
}, /*#__PURE__*/React.createElement("div", {
  className: "edu-feat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "extension")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Design-thinking certified"), /*#__PURE__*/React.createElement("p", null, "NFTE-aligned modules with hands-on assessment."))), /*#__PURE__*/React.createElement("div", {
  className: "edu-feat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "groups")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Peer cohorts"), /*#__PURE__*/React.createElement("p", null, "State-wise groups that meet monthly \u2014 online & offline."))), /*#__PURE__*/React.createElement("div", {
  className: "edu-feat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "menu_book")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Lesson kits delivered"), /*#__PURE__*/React.createElement("p", null, "Physical & digital \u2014 reset every term, no extra prep."))), /*#__PURE__*/React.createElement("div", {
  className: "edu-feat",
  "data-anim": "up",
  "data-stagger-item": true
}, /*#__PURE__*/React.createElement("div", {
  className: "ic"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "trending_up")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Career pathway"), /*#__PURE__*/React.createElement("p", null, "Recognised path to head of innovation in your school.")))), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: '2rem',
    display: 'flex',
    gap: '.75rem',
    flexWrap: 'wrap'
  }
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-purple btn-lg"
}, "Apply for certification ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward")), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost btn-lg"
}, "Download syllabus (PDF)"))))));
const Stories = () => {
  const items = [{
    img: '../../assets/slider/Akshit.png',
    cat: 'Clean Energy',
    name: 'Akshit Sharma',
    who: 'Grade 10 · Delhi',
    h: 'Affordable e-cycles for last-mile delivery.',
    p: 'Designed and tested a sub-₹18,000 e-cycle frame, now piloted by two delivery startups in Delhi NCR.',
    award: 'State winner'
  }, {
    img: '../../assets/slider/Atulya.png',
    cat: 'Edu-Tech',
    name: 'Atulya Verma',
    who: 'Grade 11 · Pune',
    h: 'A tutoring platform built by students, for students.',
    p: 'Peer-led learning circles now used in 40 schools — bridging the gap between board prep and real understanding.',
    award: 'IFT Top 50'
  }, {
    img: '../../assets/slider/Prathamesh.png',
    cat: 'Health-Tech',
    name: 'Prathamesh M.',
    who: 'Grade 12 · Mumbai',
    h: 'A wearable that nudges seniors to stay active.',
    p: 'Built with his grandfather in mind. Now in a paid pilot with two assisted-living facilities in Maharashtra.',
    award: 'NIT mentorship'
  }, {
    img: '../../assets/slider/Pushpak.png',
    cat: 'Smart Cities',
    name: 'Pushpak J.',
    who: 'Grade 9 · Bengaluru',
    h: 'A neighbourhood waste-segregation kit, gamified.',
    p: 'Inspired a school-wide composting program. Three more schools have adopted the kit since.',
    award: 'Atal Marathon'
  }, {
    img: '../../assets/slider/aryan-singh.png',
    cat: 'Agri-Tech',
    name: 'Aryan Singh',
    who: 'Grade 12 · Rajasthan',
    h: 'Mera Sathi Agrotech soil-health sensor.',
    p: 'Built and field-tested in seven villages. ₹2.1L seed grant secured for further development.',
    award: 'IFT Top 12'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "stories-rail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stories-rail-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stories-rail-head"
  }, /*#__PURE__*/React.createElement("div", {
    "data-anim": "up"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kicker"
  }, "Stories of transformation"), /*#__PURE__*/React.createElement("h2", {
    className: "display section-title",
    style: {
      maxWidth: '22ch'
    }
  }, "From classroom ", /*#__PURE__*/React.createElement("em", null, "idea"), " to nationwide impact.")), /*#__PURE__*/React.createElement("p", {
    className: "lede",
    style: {
      maxWidth: '40ch'
    },
    "data-anim": "up",
    "data-delay": "0.1"
  }, "Scroll horizontally to meet five young creators who started something real \u2014 and the work continues."), /*#__PURE__*/React.createElement("div", {
    className: "arrows",
    "data-anim": "up",
    "data-delay": "0.2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "progress-readout",
    style: {
      marginRight: '1rem',
      alignSelf: 'center'
    }
  }, "Scroll to ", /*#__PURE__*/React.createElement("b", null, "navigate \u2192")), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Previous"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "chevron_left")), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Next"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "chevron_right")))), /*#__PURE__*/React.createElement("div", {
    className: "stories-track-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stories-track"
  }, items.map(it => /*#__PURE__*/React.createElement("article", {
    className: "story-h",
    key: it.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "img-w"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cat"
  }, it.cat), /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "quote-mark"
  }, "\"")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "who"
  }, /*#__PURE__*/React.createElement("b", null, it.name), " ", /*#__PURE__*/React.createElement("span", null, "\xB7"), " ", it.who), /*#__PURE__*/React.createElement("h5", null, it.h), /*#__PURE__*/React.createElement("p", null, it.p), /*#__PURE__*/React.createElement("div", {
    className: "read"
  }, /*#__PURE__*/React.createElement("span", null, "Read story ", /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '16px'
    }
  }, "arrow_forward")), /*#__PURE__*/React.createElement("span", {
    className: "award"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "emoji_events"), it.award))))), /*#__PURE__*/React.createElement("article", {
    className: "story-h cta-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "auto_awesome")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Your student could be next."), /*#__PURE__*/React.createElement("p", null, "Nominate a creator from your school for the 2026 IFT cohort. Applications close Aug 31.")), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Submit a nomination ", /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "arrow_forward")))))));
};
const Partners = () => {
  const csr = ['microsoft.jpg', 'kotak.png', 'hsbc.webp', 'axis-bank.webp', 'tata-capital.webp', 'L&T.webp', 'un-global-compact.webp'];
  const schools = ['JBCN.png', 'sies.png', 'mount-litera.png', 'dypatil-group.png', 'garodia-international.png', 'shishuvan.png'];
  return /*#__PURE__*/React.createElement("section", {
    className: "partners"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "partners-head"
  }, /*#__PURE__*/React.createElement("div", {
    "data-anim": "right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kicker"
  }, "Trusted by"), /*#__PURE__*/React.createElement("h2", {
    className: "display section-title",
    style: {
      maxWidth: '22ch'
    }
  }, "Built with India's most ", /*#__PURE__*/React.createElement("em", null, "impact-driven"), " partners.")), /*#__PURE__*/React.createElement("p", {
    className: "lede",
    style: {
      maxWidth: '34ch'
    },
    "data-anim": "left",
    "data-delay": "0.15"
  }, "From Fortune 500 CSR programs to India's premier school networks \u2014 our partners share one goal: future-ready Indian classrooms.")), /*#__PURE__*/React.createElement("div", {
    className: "partners-label"
  }, "CSR & Foundation partners"), /*#__PURE__*/React.createElement("div", {
    className: "logo-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-track"
  }, [...csr, ...csr].map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "logo-cell",
    key: i
  }, /*#__PURE__*/React.createElement("img", {
    src: `../../assets/csr-logo/${f}`,
    alt: ""
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "partners-label"
  }, "School partners"), /*#__PURE__*/React.createElement("div", {
    className: "logo-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-track reverse"
  }, [...schools, ...schools, ...schools].map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "logo-cell",
    key: i
  }, /*#__PURE__*/React.createElement("img", {
    src: `../../assets/school-logo/${f}`,
    alt: ""
  })))))));
};
const CtaBanner = () => /*#__PURE__*/React.createElement("section", {
  className: "cta-banner-wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "cta-banner",
  "data-anim": "scale-up"
}, /*#__PURE__*/React.createElement("div", {
  "data-anim": "right",
  "data-delay": "0.2"
}, /*#__PURE__*/React.createElement("span", {
  className: "kicker"
}, "For school leaders"), /*#__PURE__*/React.createElement("h3", null, "Bring ENpower to your school \u2014", /*#__PURE__*/React.createElement("br", null), "and shape ", /*#__PURE__*/React.createElement("em", null, "India's"), " next generation."), /*#__PURE__*/React.createElement("p", null, "Talk to our partnership team. We'll design a bespoke future-skills program for your campus, including a 14-day pilot at no cost.")), /*#__PURE__*/React.createElement("div", {
  className: "cta-banner-right",
  "data-anim": "left",
  "data-delay": "0.3"
}, /*#__PURE__*/React.createElement("a", {
  className: "btn btn-gold btn-lg",
  style: {
    width: '100%',
    justifyContent: 'center'
  }
}, "Book a partnership call ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward")), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-ghost-light btn-lg",
  style: {
    width: '100%',
    justifyContent: 'center'
  }
}, "Download brochure (PDF \xB7 4 MB)"), /*#__PURE__*/React.createElement("div", {
  className: "quick"
}, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "check_circle"), " 14-day pilot"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "check_circle"), " Train-the-trainer"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "check_circle"), " CBSE aligned"))))));
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-brand"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/ENP-logo.png",
  alt: "ENpower"
}), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", {
  style: {
    color: '#fff'
  }
}, "Think. Create. Lead."), /*#__PURE__*/React.createElement("br", null), "India's first integrated future-skills ecosystem for K-12 schools. A venture by Enlearning Skill Development Limited, in strategic alliance with TATA ClassEdge."), /*#__PURE__*/React.createElement("div", {
  className: "footer-socials"
}, /*#__PURE__*/React.createElement("a", {
  "aria-label": "LinkedIn"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "share")), /*#__PURE__*/React.createElement("a", {
  "aria-label": "Instagram"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "photo_camera")), /*#__PURE__*/React.createElement("a", {
  "aria-label": "Facebook"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "public")), /*#__PURE__*/React.createElement("a", {
  "aria-label": "YouTube"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "smart_display"))), /*#__PURE__*/React.createElement("div", {
  className: "footer-contact"
}, /*#__PURE__*/React.createElement("div", {
  className: "row-c"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "mail"), "info@enlearning.in"), /*#__PURE__*/React.createElement("div", {
  className: "row-c"
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "place"), "1402 Dosti Carnation, Antop Hill, Mumbai 400037"))), /*#__PURE__*/React.createElement("div", {
  className: "footer-col"
}, /*#__PURE__*/React.createElement("h6", null, "Programs"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Future Skills Lab"), /*#__PURE__*/React.createElement("li", null, "Tech Innovation Lab"), /*#__PURE__*/React.createElement("li", null, "Composite Skills Lab"), /*#__PURE__*/React.createElement("li", null, "Training & Certification"), /*#__PURE__*/React.createElement("li", null, "Impact Programs"), /*#__PURE__*/React.createElement("li", null, "India's Future Tycoons ", /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, "NEW")))), /*#__PURE__*/React.createElement("div", {
  className: "footer-col"
}, /*#__PURE__*/React.createElement("h6", null, "Company"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "About ENpower"), /*#__PURE__*/React.createElement("li", null, "Our story \xB7 2015\u20132025"), /*#__PURE__*/React.createElement("li", null, "Team & advisors"), /*#__PURE__*/React.createElement("li", null, "Careers ", /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, "7 open")), /*#__PURE__*/React.createElement("li", null, "Press & media"), /*#__PURE__*/React.createElement("li", null, "Contact"))), /*#__PURE__*/React.createElement("div", {
  className: "footer-col"
}, /*#__PURE__*/React.createElement("h6", null, "Stay in the loop"), /*#__PURE__*/React.createElement("div", {
  className: "footer-news"
}, /*#__PURE__*/React.createElement("small", null, /*#__PURE__*/React.createElement("b", null, "Monthly"), " impact stories, program updates and educator resources \u2014 straight to your inbox."), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("input", {
  placeholder: "you@school.edu"
})), /*#__PURE__*/React.createElement("button", null, "Subscribe ", /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, "arrow_forward"))))), /*#__PURE__*/React.createElement("div", {
  className: "footer-bar"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Enlearning Skill Development Limited \xB7 Designed for Indian classrooms. Built for the world."), /*#__PURE__*/React.createElement("div", {
  className: "legal"
}, /*#__PURE__*/React.createElement("a", null, "Privacy"), /*#__PURE__*/React.createElement("a", null, "Terms"), /*#__PURE__*/React.createElement("a", null, "Accessibility"), /*#__PURE__*/React.createElement("a", null, "Sitemap")))));
Object.assign(window, {
  Announce,
  Nav,
  Hero,
  Cred,
  Mission,
  Engagements,
  Footprint,
  Spotlight,
  Pillars,
  Educators,
  Stories,
  Partners,
  CtaBanner,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Components.v1.jsx
try { (() => {
// Components.jsx — ENpower website UI kit (rich)
const {
  useState
} = React;
const Nav = ({
  active = 'home',
  onNav
}) => /*#__PURE__*/React.createElement("nav", {
  className: "enp-nav"
}, /*#__PURE__*/React.createElement("a", {
  className: "enp-logo",
  href: "#"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/ENP-logo.png",
  alt: "ENpower"
})), /*#__PURE__*/React.createElement("ul", {
  className: "enp-navlinks"
}, ['Home', 'Future Skills Lab', 'Innovation', 'IFT', 'Training', 'Impact', 'About'].map(l => /*#__PURE__*/React.createElement("li", {
  key: l
}, /*#__PURE__*/React.createElement("a", {
  className: active === l.toLowerCase() ? 'on' : '',
  onClick: () => onNav && onNav(l)
}, l)))), /*#__PURE__*/React.createElement("a", {
  className: "btn btn-solid"
}, "Get In Touch \u2192"));
const Announce = () => /*#__PURE__*/React.createElement("div", {
  className: "enp-announce"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot"
}), "LIVE \u2014 Applications open for the 2026 Future Creators cohort.", /*#__PURE__*/React.createElement("a", null, "Apply now \u2192"));
const Hero = () => /*#__PURE__*/React.createElement("section", {
  className: "enp-hero"
}, /*#__PURE__*/React.createElement("span", {
  className: "enp-sparkle s1 material-symbols-outlined"
}, "auto_awesome"), /*#__PURE__*/React.createElement("span", {
  className: "enp-sparkle s2 material-symbols-outlined"
}, "auto_awesome"), /*#__PURE__*/React.createElement("span", {
  className: "enp-sparkle s3 material-symbols-outlined"
}, "star"), /*#__PURE__*/React.createElement("span", {
  className: "enp-sparkle s4 material-symbols-outlined"
}, "auto_awesome"), /*#__PURE__*/React.createElement("div", {
  className: "enp-hero-inner"
}, /*#__PURE__*/React.createElement("span", {
  className: "enp-hero-pill"
}, /*#__PURE__*/React.createElement("span", {
  className: "tag"
}, "NEW"), " 2030 Mission \xB7 Reach 1 crore learners"), /*#__PURE__*/React.createElement("h1", {
  className: "enp-hero-h"
}, "Nurturing a", ' ', /*#__PURE__*/React.createElement("span", {
  className: "enp-cap enp-cap-sm"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/aryan-singh.png",
  alt: ""
})), ' ', "Generation of", ' ', /*#__PURE__*/React.createElement("span", {
  className: "enp-cap enp-cap-md"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/hero2.png",
  alt: ""
})), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  className: "enp-hl"
}, "Future Creators")), /*#__PURE__*/React.createElement("p", {
  className: "enp-hero-sub"
}, "Empowering children with future skills, entrepreneurial mindsets and the confidence to", ' ', /*#__PURE__*/React.createElement("b", null, "Think. Create. Lead.")), /*#__PURE__*/React.createElement("div", {
  className: "enp-hero-ctas"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-primary btn-lg"
}, "Explore Partnership \u2192"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-ghost btn-lg"
}, "\u25B6 Watch our Story")), /*#__PURE__*/React.createElement("div", {
  className: "enp-hero-trust"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-hero-stack"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/Akshit.png",
  alt: ""
}), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/Atulya.png",
  alt: ""
}), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/Prathamesh.png",
  alt: ""
}), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/Pushpak.png",
  alt: ""
}), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/slider/aryan-singh.png",
  alt: ""
})), /*#__PURE__*/React.createElement("span", null, "Joined by ", /*#__PURE__*/React.createElement("b", {
  style: {
    color: '#1c1430'
  }
}, "200K+ learners"), " across 12 states"))));
const Marquee = () => {
  const items = ['Think.', 'Create.', 'Lead.', 'Future-ready.', 'Made in India.', 'For the world.'];
  const loop = [...items, ...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    className: "enp-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-marquee-track"
  }, loop.map((t, i) => /*#__PURE__*/React.createElement("span", {
    className: "enp-marquee-item",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "star"
  }, "\u2726"), /*#__PURE__*/React.createElement("em", null, t)))));
};
const Counters = () => {
  const stats = [{
    n: '12',
    plus: '+',
    l: 'States in India',
    pct: 60
  }, {
    n: '750',
    plus: '+',
    l: 'Partner Schools',
    pct: 82
  }, {
    n: '200',
    plus: 'K+',
    l: 'Future Leaders',
    pct: 48
  }, {
    n: '145',
    plus: '+',
    l: 'Thinking Coaches',
    pct: 36
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "enp-counters-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-counters"
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    className: "enp-counter",
    key: s.l
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-counter-n"
  }, s.n, /*#__PURE__*/React.createElement("span", {
    className: "plus"
  }, s.plus)), /*#__PURE__*/React.createElement("div", {
    className: "enp-counter-l"
  }, s.l), /*#__PURE__*/React.createElement("div", {
    className: "enp-counter-bar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: s.pct + '%'
    }
  }))))));
};
const Engagements = () => {
  const items = [{
    img: '../../assets/home/FSL.jpg',
    tag: 'Flagship',
    title: 'Future Skills Lab',
    sub: "India's First Integrated Future-Skills Ecosystem"
  }, {
    img: '../../assets/home/TIL.jpg',
    tag: 'STEM',
    title: 'Tech Innovation Lab',
    sub: 'Transforming STEM through innovation'
  }, {
    img: '../../assets/home/CSL.jpg',
    tag: 'Creative',
    title: 'Creative Studio Lab',
    sub: 'Where curiosity meets creation'
  }, {
    img: '../../assets/home/TTA.jpg',
    tag: 'Educators',
    title: 'Teacher Training',
    sub: 'Building capacity for new-age educators'
  }, {
    img: '../../assets/home/IP1.jpg',
    tag: 'Outreach',
    title: 'Impact Programs',
    sub: 'Reaching every child, everywhere'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "enp-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "enp-eyebrow"
  }, "Engagements"), /*#__PURE__*/React.createElement("h2", {
    className: "enp-h2"
  }, "A complete ", /*#__PURE__*/React.createElement("em", null, "future-skills"), " ecosystem"), /*#__PURE__*/React.createElement("p", {
    className: "enp-lead"
  }, "Five interlocking programs that meet every learner \u2014 and every educator \u2014 where they are.")), /*#__PURE__*/React.createElement("div", {
    className: "enp-eng-grid"
  }, items.map(it => /*#__PURE__*/React.createElement("article", {
    className: "enp-eng-card",
    key: it.title
  }, /*#__PURE__*/React.createElement("img", {
    src: it.img,
    className: "enp-eng-bg",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "enp-eng-ov"
  }), /*#__PURE__*/React.createElement("div", {
    className: "enp-eng-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "enp-eng-badge"
  }, it.tag), /*#__PURE__*/React.createElement("div", {
    className: "enp-eng-bottom"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, it.title), /*#__PURE__*/React.createElement("p", null, it.sub)), /*#__PURE__*/React.createElement("div", {
    className: "enp-eng-arrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "arrow_forward"))))))));
};
const Pillars = () => {
  const items = [{
    gif: '../../assets/icons/foundation-literacy.gif',
    n: '01',
    title: 'Foundation Literacy',
    desc: 'Reading, numeracy and digital basics that scaffold every other skill.'
  }, {
    gif: '../../assets/icons/future-competency.gif',
    n: '02',
    title: 'Future Competency',
    desc: 'Critical thinking, problem-solving and decision-making.'
  }, {
    gif: '../../assets/icons/human-skills.gif',
    n: '03',
    title: 'Human Skills',
    desc: 'Empathy, collaboration and communication.'
  }, {
    gif: '../../assets/icons/self-exploration.gif',
    n: '04',
    title: 'Self Exploration',
    desc: 'Identity, agency and personal goal-setting.'
  }, {
    gif: '../../assets/icons/tech-of-the-future.gif',
    n: '05',
    title: 'Tech of the Future',
    desc: 'AI, robotics, design and emerging tools.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "enp-section enp-bg-lav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "enp-eyebrow"
  }, "17 Skill Pillars"), /*#__PURE__*/React.createElement("h2", {
    className: "enp-h2"
  }, "Five focus areas that ", /*#__PURE__*/React.createElement("em", null, "shape"), " a future creator")), /*#__PURE__*/React.createElement("div", {
    className: "enp-pillar-grid"
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    className: "enp-pillar",
    key: it.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-pillar-num"
  }, "PILLAR ", it.n), /*#__PURE__*/React.createElement("img", {
    src: it.gif,
    alt: ""
  }), /*#__PURE__*/React.createElement("h4", null, it.title), /*#__PURE__*/React.createElement("p", null, it.desc)))));
};
const Stories = () => {
  const items = [{
    img: '../../assets/slider/aryan-singh.png',
    name: 'Aryan Singh',
    loc: 'Grade 12 · Rajasthan',
    cat: 'Social Impact',
    q: 'Mera Sathi Agrotech combines tech of the future with empathy and innovation.',
    tag: 'Agri-Tech'
  }, {
    img: '../../assets/slider/Akshit.png',
    name: 'Akshit Sharma',
    loc: 'Grade 10 · Delhi',
    cat: 'Green Mobility',
    q: 'Designing affordable e-cycles for last-mile delivery in our neighbourhood.',
    tag: 'Clean Energy'
  }, {
    img: '../../assets/slider/Atulya.png',
    name: 'Atulya Verma',
    loc: 'Grade 11 · Pune',
    cat: 'Edu-Tech',
    q: 'A tutoring platform built by students, for students.',
    tag: 'Learning'
  }, {
    img: '../../assets/slider/Prathamesh.png',
    name: 'Prathamesh',
    loc: 'Grade 12 · Mumbai',
    cat: 'Health-Tech',
    q: 'Wearable that nudges senior citizens to stay active and hydrated.',
    tag: 'Wellness'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "enp-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "enp-eyebrow"
  }, "Future Creators"), /*#__PURE__*/React.createElement("h2", {
    className: "enp-h2"
  }, "Real stories. ", /*#__PURE__*/React.createElement("em", null, "Real impact."))), /*#__PURE__*/React.createElement("div", {
    className: "enp-stories"
  }, items.map(it => /*#__PURE__*/React.createElement("article", {
    className: "enp-story",
    key: it.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-story-img"
  }, /*#__PURE__*/React.createElement("span", {
    className: "enp-story-cat"
  }, it.cat), /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "enp-story-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "enp-story-head"
  }, /*#__PURE__*/React.createElement("h5", null, it.name), /*#__PURE__*/React.createElement("p", {
    className: "enp-story-loc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px'
    }
  }, "location_on"), it.loc)), /*#__PURE__*/React.createElement("p", {
    className: "enp-story-q"
  }, it.q), /*#__PURE__*/React.createElement("div", {
    className: "enp-story-foot"
  }, /*#__PURE__*/React.createElement("b", null, it.tag), /*#__PURE__*/React.createElement("span", {
    className: "award"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "emoji_events"), "National recognition")))))));
};
const Vision = () => /*#__PURE__*/React.createElement("section", {
  className: "enp-section enp-bg-vision"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-vision-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "enp-eyebrow"
}, "Our 2030 Mission"), /*#__PURE__*/React.createElement("h2", {
  className: "enp-h2",
  style: {
    marginBottom: '1rem'
  }
}, "Reach ", /*#__PURE__*/React.createElement("em", null, "1 crore"), " future-ready learners by ", /*#__PURE__*/React.createElement("em", null, "2030"), "."), /*#__PURE__*/React.createElement("p", {
  className: "enp-lead"
}, "Equip educators to lead the evolution. Build a national ecosystem where every child can Think, Create and Lead \u2014 regardless of geography or background."), /*#__PURE__*/React.createElement("div", {
  className: "enp-vision-stats"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-vision-stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, "2.4M"), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Learners reached by 2024")), /*#__PURE__*/React.createElement("div", {
  className: "enp-vision-stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "n"
}, "67%"), /*#__PURE__*/React.createElement("div", {
  className: "l"
}, "Progress to 2030 goal"))), /*#__PURE__*/React.createElement("div", {
  className: "enp-progress"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-progress-bar"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: '67%'
  }
})), /*#__PURE__*/React.createElement("div", {
  className: "enp-progress-foot"
}, /*#__PURE__*/React.createElement("span", null, "FY 2025"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "67% to 2030"))))), /*#__PURE__*/React.createElement("img", {
  src: "../../assets/home/enpower-philosophy.png",
  alt: "",
  className: "enp-vision-img"
})));
const Partners = () => /*#__PURE__*/React.createElement("section", {
  className: "enp-section"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-section-head"
}, /*#__PURE__*/React.createElement("span", {
  className: "enp-eyebrow"
}, "Trusted by"), /*#__PURE__*/React.createElement("h2", {
  className: "enp-h2"
}, "Backed by India's most ", /*#__PURE__*/React.createElement("em", null, "impact-driven"), " partners")), /*#__PURE__*/React.createElement("div", {
  className: "enp-partners-label"
}, "CSR PARTNERS"), /*#__PURE__*/React.createElement("div", {
  className: "enp-logo-row"
}, ['microsoft.jpg', 'kotak.png', 'hsbc.webp', 'axis-bank.webp', 'tata-capital.webp', 'L&T.webp', 'un-global-compact.webp'].map(f => /*#__PURE__*/React.createElement("div", {
  className: "enp-logo-cell",
  key: f
}, /*#__PURE__*/React.createElement("img", {
  src: `../../assets/csr-logo/${f}`,
  alt: ""
})))), /*#__PURE__*/React.createElement("div", {
  className: "enp-partners-label"
}, "SCHOOL PARTNERS"), /*#__PURE__*/React.createElement("div", {
  className: "enp-logo-row"
}, ['JBCN.png', 'sies.png', 'mount-litera.png', 'dypatil-group.png', 'garodia-international.png', 'shishuvan.png'].map(f => /*#__PURE__*/React.createElement("div", {
  className: "enp-logo-cell",
  key: f
}, /*#__PURE__*/React.createElement("img", {
  src: `../../assets/school-logo/${f}`,
  alt: ""
})))));
const CtaBanner = () => /*#__PURE__*/React.createElement("section", {
  className: "enp-cta-banner"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Bring ENpower to ", /*#__PURE__*/React.createElement("em", null, "your school"), " \u2014 and shape India's next generation."), /*#__PURE__*/React.createElement("p", null, "Talk to our partnership team to design a bespoke future-skills program for your campus.")), /*#__PURE__*/React.createElement("div", {
  className: "enp-cta-banner-right"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-primary btn-lg"
}, "Become a Partner School \u2192"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-ghost btn-lg"
}, "Download Brochure (PDF)")));
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "enp-footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "enp-footer-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/ENP-logo.png",
  className: "enp-footer-logo",
  alt: "ENpower"
}), /*#__PURE__*/React.createElement("p", null, "Empowering young creators to think, create and lead \u2014 building India's future-ready generation."), /*#__PURE__*/React.createElement("div", {
  className: "enp-socials"
}, ['public', 'mail', 'call', 'share'].map(s => /*#__PURE__*/React.createElement("a", {
  key: s
}, /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined"
}, s))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h6", null, "Engagements"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Future Skills Lab"), /*#__PURE__*/React.createElement("li", null, "Tech Innovation Lab"), /*#__PURE__*/React.createElement("li", null, "Creative Studio Lab"), /*#__PURE__*/React.createElement("li", null, "Teacher Training"), /*#__PURE__*/React.createElement("li", null, "Impact Programs"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h6", null, "Company"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "About ENpower"), /*#__PURE__*/React.createElement("li", null, "Careers"), /*#__PURE__*/React.createElement("li", null, "Press & Media"), /*#__PURE__*/React.createElement("li", null, "Contact"), /*#__PURE__*/React.createElement("li", null, "Privacy & Terms"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h6", null, "Stay in the loop"), /*#__PURE__*/React.createElement("div", {
  className: "enp-newsletter"
}, /*#__PURE__*/React.createElement("input", {
  placeholder: "you@school.edu"
}), /*#__PURE__*/React.createElement("button", null, "\u2192")), /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: '1rem',
    fontSize: '.78rem'
  }
}, "Monthly impact stories, program updates and educator resources."))), /*#__PURE__*/React.createElement("div", {
  className: "enp-footer-bar"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Enlearning Skill Development Limited"), /*#__PURE__*/React.createElement("span", null, "Designed for Indian classrooms. Built for the world.")));
Object.assign(window, {
  Nav,
  Announce,
  Hero,
  Marquee,
  Counters,
  Engagements,
  Pillars,
  Stories,
  Vision,
  Partners,
  CtaBanner,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Components.v1.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/gsap-anim.js
try { (() => {
// ENpower scroll animations — GSAP 3 + ScrollTrigger
// Powers [data-anim], [data-count], [data-parallax], horizontal stories rail,
// border-beam ticker, and spotlight cursor tracking.
(function () {
  'use strict';

  function ready() {
    if (!window.gsap || !window.ScrollTrigger) {
      return setTimeout(ready, 50);
    }
    if (!document.getElementById('root') || !document.getElementById('root').children.length) {
      return setTimeout(ready, 50);
    }
    requestAnimationFrame(boot);
  }

  // Safety: if GSAP/scripts fail to load within 4s, reveal everything so the page is usable.
  setTimeout(() => {
    if (!document.body.classList.contains('gsap-ready')) {
      document.querySelectorAll('[data-anim]').forEach(el => {
        el.style.opacity = '1';
      });
    }
  }, 4000);
  function boot() {
    const {
      gsap,
      ScrollTrigger
    } = window;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-count]').forEach(el => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    // ---------- Defaults ----------
    gsap.defaults({
      ease: 'power3.out'
    });

    // ---------- Reveal animations from [data-anim] ----------
    const ANIM_MAP = {
      'fade': {
        y: 0,
        x: 0,
        scale: 1,
        rot: 0
      },
      'up': {
        y: 48,
        x: 0,
        scale: 1,
        rot: 0
      },
      'up-sm': {
        y: 22,
        x: 0,
        scale: 1,
        rot: 0
      },
      'down': {
        y: -32,
        x: 0,
        scale: 1,
        rot: 0
      },
      'left': {
        y: 0,
        x: 48,
        scale: 1,
        rot: 0
      },
      'right': {
        y: 0,
        x: -48,
        scale: 1,
        rot: 0
      },
      'scale': {
        y: 0,
        x: 0,
        scale: 0.92,
        rot: 0
      },
      'scale-up': {
        y: 40,
        x: 0,
        scale: 0.95,
        rot: 0
      },
      'rot-l': {
        y: 30,
        x: -20,
        scale: 0.92,
        rot: -12
      },
      'rot-r': {
        y: 30,
        x: 20,
        scale: 0.92,
        rot: 12
      }
    };
    gsap.utils.toArray('[data-anim]').forEach(el => {
      if (el.dataset._gsap === '1') return;
      el.dataset._gsap = '1';
      const kind = el.dataset.anim || 'up';
      const cfg = ANIM_MAP[kind] || ANIM_MAP.up;
      const delay = parseFloat(el.dataset.delay || '0');
      gsap.fromTo(el, {
        opacity: 0,
        x: cfg.x,
        y: cfg.y,
        scale: cfg.scale,
        rotation: cfg.rot
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.95,
        delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // ---------- Stagger groups ----------
    gsap.utils.toArray('[data-stagger]').forEach(parent => {
      const items = parent.querySelectorAll('[data-stagger-item]');
      if (!items.length) return;
      const step = parseFloat(parent.dataset.staggerStep || '0.08');
      const base = parseFloat(parent.dataset.staggerBase || '0');
      items.forEach((el, i) => {
        if (el.dataset._gsap === '1') return;
        el.dataset._gsap = '1';
        const kind = el.dataset.anim || 'up';
        const cfg = ANIM_MAP[kind] || ANIM_MAP.up;
        gsap.fromTo(el, {
          opacity: 0,
          x: cfg.x,
          y: cfg.y,
          scale: cfg.scale,
          rotation: cfg.rot
        }, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.9,
          delay: base + i * step,
          scrollTrigger: {
            trigger: parent,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    });

    // ---------- Counters ----------
    gsap.utils.toArray('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const dur = parseFloat(el.dataset.duration || '1800') / 1000;
      const obj = {
        v: 0
      };
      el.textContent = '0';
      gsap.to(obj, {
        v: target,
        duration: dur,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          el.textContent = obj.v.toFixed(decimals);
        },
        onComplete: () => {
          el.textContent = target.toString();
        }
      });
    });

    // ---------- Hero headline word reveal ----------
    document.querySelectorAll('.hero-h .row1, .hero-h .row2, .hero-h .row3').forEach((row, i) => {
      gsap.fromTo(row, {
        y: 60,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        delay: 0.1 + i * 0.15
      });
    });
    // underline draw-on via CSS var
    const underline = document.querySelector('.hero-h .underline');
    if (underline) {
      const obj = {
        v: 0
      };
      gsap.to(obj, {
        v: 1,
        duration: 1.2,
        ease: 'power2.inOut',
        delay: 0.7,
        onUpdate: () => underline.style.setProperty('--draw', obj.v)
      });
    }

    // ---------- Parallax ----------
    gsap.utils.toArray('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax);
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // ---------- Scroll progress bar ----------
    const progress = document.querySelector('[data-progress]');
    if (progress) {
      gsap.set(progress, {
        scaleX: 0,
        transformOrigin: 'left center'
      });
      gsap.to(progress, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          scrub: 0.25
        }
      });
    }

    // ---------- Horizontal scroll: Stories Rail ----------
    const rail = document.querySelector('.stories-rail');
    if (rail && window.innerWidth > 900) {
      const track = rail.querySelector('.stories-track');
      const pin = rail.querySelector('.stories-rail-inner');
      if (track && pin) {
        // compute distance after layout
        const setup = () => {
          const distance = Math.max(0, track.scrollWidth - window.innerWidth + 120);
          ScrollTrigger.create({
            trigger: rail,
            start: 'top top',
            end: () => '+=' + distance,
            pin: pin,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            animation: gsap.to(track, {
              x: -distance,
              ease: 'none'
            })
          });
        };
        setTimeout(setup, 100);
      }
    }

    // ---------- Hero collage frame hover-tilt with mouse ----------
    const collage = document.querySelector('.hero-collage');
    if (collage) {
      collage.addEventListener('mousemove', e => {
        const rect = collage.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
        const frames = collage.querySelectorAll('.frame');
        frames.forEach((f, i) => {
          const depth = (i + 1) * 8;
          gsap.to(f, {
            x: dx * depth,
            y: dy * depth,
            duration: 0.6,
            ease: 'power2.out'
          });
        });
      });
      collage.addEventListener('mouseleave', () => {
        gsap.to(collage.querySelectorAll('.frame'), {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });
    }

    // ---------- Spotlight cursor on cards ----------
    document.querySelectorAll('[data-spotlight]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * 100;
        const y = (e.clientY - r.top) / r.height * 100;
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
      });
    });

    // ---------- Magnetic hover on CTAs ----------
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });

    // ---------- Marquee credibility row uses GSAP infinite ----------
    const credTrack = document.querySelector('.cred-track');
    if (credTrack) {
      credTrack.style.animation = 'none';
      const w = credTrack.scrollWidth / 2;
      gsap.to(credTrack, {
        x: -w,
        duration: 28,
        ease: 'none',
        repeat: -1
      });
    }
    document.querySelectorAll('.logo-track').forEach(tr => {
      tr.style.animation = 'none';
      const w = tr.scrollWidth / 2;
      const reverse = tr.classList.contains('reverse');
      gsap.to(tr, {
        x: reverse ? 0 : -w,
        duration: reverse ? 48 : 40,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % w)
        }
      });
      if (reverse) gsap.set(tr, {
        x: -w
      });
    });

    // ---------- Refresh on load ----------
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
    document.body.classList.add('gsap-ready');
  }
  ready();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/gsap-anim.js", error: String((e && e.message) || e) }); }

// ui_kits/website/scroll-anim.js
try { (() => {
// ENpower scroll animations — vanilla IntersectionObserver + rAF
// Watches [data-anim], [data-count], [data-parallax], [data-progress]
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Reveal observer ----------
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || '0');
        if (delay > 0) {
          setTimeout(() => el.classList.add('anim-in'), delay * 1000);
        } else {
          el.classList.add('anim-in');
        }
        revealObserver.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // ---------- Stagger children ----------
  function applyStagger(parent) {
    const step = parseFloat(parent.dataset.staggerStep || '0.08');
    const base = parseFloat(parent.dataset.staggerBase || '0');
    const items = parent.querySelectorAll('[data-stagger-item]');
    items.forEach((item, i) => {
      item.style.setProperty('--anim-delay', base + i * step + 's');
    });
  }

  // ---------- Counter roll-up ----------
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
  function rollCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = parseFloat(el.dataset.duration || '1600');
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = target * easeOutQuart(t);
      el.textContent = v.toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);else el.textContent = target.toString();
    }
    requestAnimationFrame(frame);
  }
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        rollCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.4
  });

  // ---------- Parallax (rAF-throttled) ----------
  const parallaxItems = [];
  let scrollPending = false;
  function onScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      parallaxItems.forEach(it => {
        const rect = it.el.getBoundingClientRect();
        // only run when on screen
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * it.speed;
        it.el.style.transform = `${it.baseTransform} translate3d(0, ${offset}px, 0)`;
      });

      // progress bar
      if (progressEl) {
        const max = document.documentElement.scrollHeight - vh;
        const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        progressEl.style.transform = `scaleX(${pct})`;
      }
      scrollPending = false;
    });
  }

  // ---------- Init ----------
  let progressEl = null;
  function init() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-anim]').forEach(el => el.classList.add('anim-in'));
      document.querySelectorAll('[data-count]').forEach(el => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    // progress bar
    progressEl = document.querySelector('[data-progress]');

    // stagger groups
    document.querySelectorAll('[data-stagger]').forEach(applyStagger);

    // reveals
    document.querySelectorAll('[data-anim]').forEach(el => revealObserver.observe(el));

    // counters
    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = '0';
      counterObserver.observe(el);
    });

    // parallax targets
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax);
      const base = getComputedStyle(el).transform;
      parallaxItems.push({
        el,
        speed,
        baseTransform: base === 'none' ? '' : base
      });
    });
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    onScroll();
  }

  // call after Babel render
  function safeInit() {
    if (document.getElementById('root') && document.getElementById('root').children.length) {
      init();
    } else {
      setTimeout(safeInit, 50);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

  // re-init helper for any dynamic mounts
  window.__enpScrollInit = init;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/scroll-anim.js", error: String((e && e.message) || e) }); }

})();
