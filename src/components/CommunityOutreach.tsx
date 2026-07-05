import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Sparkles, Users, MapPin, TrendingUp, Gift, Globe, 
  User, Mail, Phone, Clock, ChevronRight, X, Check, Calendar, FileText
} from "lucide-react";

interface CommunityOutreachProps {
  language: "en" | "ss";
}

type OutreachCategory = 'All' | 'Charity Projects' | 'Community Programs' | 'Youth Empowerment' | 'Evangelism Activities' | 'Mission Trips';

interface OutreachProject {
  id: string;
  category: OutreachCategory;
  title: { en: string; ss: string };
  subtitle: { en: string; ss: string };
  image: string;
  stats: { en: string; ss: string };
  description: { en: string; ss: string };
  successStory: {
    title: { en: string; ss: string };
    quote: { en: string; ss: string };
    narrative: { en: string; ss: string };
  };
  opportunity: { en: string; ss: string };
  availableRoles: string[];
}

export default function CommunityOutreach({ language }: CommunityOutreachProps) {
  const [selectedCategory, setSelectedCategory] = useState<OutreachCategory>("All");
  const [selectedStory, setSelectedStory] = useState<OutreachProject | null>(null);
  const [selectedVolunteerProject, setSelectedVolunteerProject] = useState<OutreachProject | null>(null);

  // Form states
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [volunteerRole, setVolunteerRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const stats: any[] = [];

  const categories: OutreachCategory[] = [
    "All",
    "Charity Projects",
    "Community Programs",
    "Youth Empowerment",
    "Evangelism Activities",
    "Mission Trips"
  ];

  const categoryTranslations: Record<OutreachCategory, { en: string; ss: string }> = {
    "All": { en: "All Projects", ss: "Tonke Tinhlelo" },
    "Charity Projects": { en: "Charity Projects", ss: "Tinhlelo Telihle" },
    "Community Programs": { en: "Community Programs", ss: "Temphakatsi" },
    "Youth Empowerment": { en: "Youth Empowerment", ss: "Kutfutfukisa Intsha" },
    "Evangelism Activities": { en: "Evangelism Activities", ss: "Vangeli lasekhaya" },
    "Mission Trips": { en: "Mission Trips", ss: "Tinkambo Tetitfunywa" }
  };

  const projects: OutreachProject[] = [
    {
      id: "p-relief",
      category: "Charity Projects",
      title: {
        en: "Fonteyn Blanket & Food Relief",
        ss: "Lusito Lwetingubo Nekudla KwaseteFonteyn"
      },
      subtitle: {
        en: "Blanket Relief Outreach",
        ss: "Lusito Lwetingubo Nasebuntfubeni"
      },
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=70&w=600&fm=webp",
      stats: {
        en: "350+ blankets and food parcels distributed in winter.",
        ss: "Tingubo letingetulu kwemakhulu lamatsatfu nemasaka ekudla anikeliwe."
      },
      description: {
        en: "Providing essential warmth, nutrition, and pastoral prayers to vulnerable families in the hills of Fonteyn and nearby informal settlements.",
        ss: "Kuniketa lifutho lekushisa, kudla kwemtimba, nemikhuleko yelutsandvo emakhakhambeni laswelako emagqumeni aseFonteyn netindzawo letivakaselekile."
      },
      successStory: {
        title: {
          en: "Mrs. Shongwe's Testimony of Hope",
          ss: "Bufakazi beLitsemba bakaMake Shongwe"
        },
        quote: {
          en: "“I didn't know how we would survive this winter, but the church brought God's warmth directly to my home.”",
          ss: "“Bengingasomubone kutsi sitophila njani kulefubutsanyana, kambe libandla liletse kufutsumala kwaNkulunkulu lapha ekhaya lamu.”"
        },
        narrative: {
          en: "During the freezing winter of 2026, Mrs. Shongwe, an elderly widow caring for four grandchildren, received thick blankets and a dry food pack from the church outreach team. This support shielded her family from harsh temperatures and allowed her to direct her limited resources to school fees for the children. More than the physical aid, she shared that the prayer session with our volunteers restored her joy and faith.",
          ss: "Kulefubutsanyana langa-2026, Make Shongwe, umfelokati lowesalukazi lonakekele batukulu bakhe labane, watfola tingubo letishisako kanye neliphakethe lekudla kubavolontiya belibandla. Lolusito lwavikela umndeni wakhe ekubandzeni lokumatima, lwamniketa nendlela yekubhadalela bantfwana imali yesikolo. Lokubaluleke kakhulu, umkhuleko laphuma kubavolontiya wetfule litsemba nentsandvo ngetinhlitiyo tabo."
        }
      },
      opportunity: {
        en: "Join our next distribution team to organize, pack, or drive parcels to needy households.",
        ss: "Hlanganyela nelicembu lekupaka, nobe ngetitfuthi letitawuhambisa loku kudla netingubo."
      },
      availableRoles: ["Packer", "Driver", "Visitation Prayer Companion", "Logistics Helper"]
    },
    {
      id: "p-clinic",
      category: "Community Programs",
      title: {
        en: "Fonteyn Medical Clinic Program",
        ss: "Umcimbi weTekwelashwa Wamahhala"
      },
      subtitle: {
        en: "Free Healthcare & Counseling",
        ss: "Kwelashwa nemikhuleko yamahhala"
      },
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=70&w=600&fm=webp",
      stats: {
        en: "220+ community members received free medical checkups.",
        ss: "Bantfu letingetulu kwemakhulu lamabili bahloliwe, batfola nemitsi yamahhala."
      },
      description: {
        en: "Partnering with Christian healthcare professionals to offer free health screening, basic treatments, dental checkups, and spiritual counseling.",
        ss: "Kubambisana nabo-dokotela nabonesi beKrestu kute kuhloliwe imitimba, kuniketwe imitsi lelulula, nekuphatseka ngetemikhuleko."
      },
      successStory: {
        title: {
          en: "Early Blood Pressure Detection Saves Life",
          ss: "Kuhlola kwasindzisa imphilo kababe Maseko"
        },
        quote: {
          en: "“This clinic saved my life, and the prayers gave me peace.”",
          ss: "“Lekiliniki isindzise imphilo yamikhulu, kanti nemikhuleko ingiphe kuthula lokukhulu.”"
        },
        narrative: {
          en: "A young father from the neighborhood attended the clinic because of light headaches. Upon screening, volunteer doctors discovered his blood pressure was at a critical stroke-risk level. He was immediately prescribed medication, counseled on lifestyle modifications, and joined in prayer. Regular follow-ups show his health has stabilized perfectly. He now serves as a community clinic promoter.",
          ss: "Babe wekhaya lofikile ekiliniki abesalatjelwa tinhloko. Dokotela wamfola aneliphezulu kakhulu leningozi yestroke. Watfola imitsi madvutane, nemfundiso yekudla nekuphila kahle. Loku kuhlola kwasindzisa imphilo yakhe mbamba, kantsi nyalo ufundzisa nabanye ngetempilo."
        }
      },
      opportunity: {
        en: "Medical professionals (doctors, nurses, pharmacists) and general assistants are needed.",
        ss: "Siyadzinga bodokotela, bonesi, baphakeli bemitse kanye nebantfu bekubhalisa."
      },
      availableRoles: ["Medical Doctor", "Nurse Practitioner", "Pharmacist Assistant", "Registration Clerk"]
    },
    {
      id: "p-youth",
      category: "Youth Empowerment",
      title: {
        en: "Youth Ignite Mentorship & Skills",
        ss: "Imfundiso neLwati lweLutsha (Youth Ignite)"
      },
      subtitle: {
        en: "Empowering the Next Generation",
        ss: "Kuniketa lutsha emanti ngetandla"
      },
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=70&w=600&fm=webp",
      stats: {
        en: "120+ young people trained in computer literacy and leadership.",
        ss: "Lutsha lolungetulu kwelikhulu nemashumi lamabili litfole ticu tetekhompyutha."
      },
      description: {
        en: "Providing mentorship, computer basic skills training, CV writing clinics, and university preparation sessions to empower young people in Mbabane.",
        ss: "Kufundzisa ngetekhompyutha, lwati lwekubhala i-CV, kufundzela univesithi kanye nekuholela lutsha kuKrestu."
      },
      successStory: {
        title: {
          en: "Sibusiso's Journey to employment",
          ss: "Kutfutfuka kwaSibusiso kutfola umsebenti"
        },
        quote: {
          en: "“The church gave me a future and taught me to lead with Christian integrity.”",
          ss: "“Lelisontfo lingiphe likusasa, laphindze langifundzisa kuphila ngetimiso taKrestu.”"
        },
        narrative: {
          en: "Sibusiso joined the Youth Ignite Program after high school, having no prior computer experience. Through our weekend sessions, he mastered typing, word processing, and internet research. Armed with a polished resume crafted in our CV clinic, he successfully applied for an administrative assistant role at a local business. Today, Sibusiso is self-sufficient and mentors younger students in our Saturday classes.",
          ss: "Sibusiso wadibana neYouth Ignite asacedza sikolo, angenalo lwati lwekhompyutha. Ngemizamo yetfu yangeMgcibelo, wafundza tindlela letinyenti. Nyalo ukatfole umsebenti lohlelekile edolobheni, uphindze ufundzise labanye ngetikhathi takhe letikhululekile."
        }
      },
      opportunity: {
        en: "We are seeking IT professionals, business mentors, and tutors for math, science, and English.",
        ss: "Sifuna bothishela be-IT, netimphilo tebhizinisi, netingcweti tetesayensi nemathemethiki."
      },
      availableRoles: ["ICT Tutor", "Math/Science Tutor", "Career Mentor", "Session Coordinator"]
    },
    {
      id: "p-visitation",
      category: "Evangelism Activities",
      title: {
        en: "Calvary Evangelism & Home Visitation",
        ss: "Imikhuleko Nelivangeli EmaKhaya (Calvary)"
      },
      subtitle: {
        en: "Sharing the Light of Christ",
        ss: "Kuyisa lukhanyiso lwaKrestu emakhaya"
      },
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=70&w=600&fm=webp",
      stats: {
        en: "450+ home visits made to share the hope of the Gospel.",
        ss: "Imindeni letingetulu kwemakhulu lamane nemashumi lasihlanu ivakashelwe emakhaya."
      },
      description: {
        en: "Our team regularly visits homes in the community to pray with families, share biblical encouragement, and offer counseling and connection to church ministries.",
        ss: "Licembu letfu lihambela emakhaya eveni kute lihlanganyele emkhulekweni, libhale tidvudvuto telibhayibheli futsi lisite ekuhlanganeni nelibandla."
      },
      successStory: {
        title: {
          en: "Restoration of the Khumalo Household",
          ss: "Kuvuselelwa Kwemundeni wakaKhumalo"
        },
        quote: {
          en: "“Peace has returned to our home, and our children are growing in faith.”",
          ss: "“Kuthula kubuyile ekhaya lapha kitsi, nebantfwana nyalo bakhulela ekholweni.”"
        },
        narrative: {
          en: "The Khumalo family was facing intense marital strain and financial pressure. Our home visitation team sat with them, offering dry groceries, professional counseling, and scriptural hope. Over several weeks of prayer, both parents renewed their commitments to God and to each other. They are now integrated members of the church band and local home cell group.",
          ss: "Umndeni wakaKhumalo bewunebuhlungu lobukhulu emshadweni. Base batfola imikhuleko kubazalwane, kuhlangana nemfundisi, nelutsandvo. Nyalo umshado wabo uvuselelwe futsi bahlala ngekuthula eveni."
        }
      },
      opportunity: {
        en: "Volunteers passionate about evangelism, prayer, and counseling are welcome to join our weekly visits.",
        ss: "Uyamenywa lowo lonelitsandvo lekushumayela, kukhuleka, nemikhuleko yasemakhaya."
      },
      availableRoles: ["Visitation Intercessor", "Gospel Presenter", "Family Counselor Companion", "Follow-up Assistant"]
    },
    {
      id: "p-mission",
      category: "Mission Trips",
      title: {
        en: "Mhlambanyatsi Mission Outreach",
        ss: "Luhlelo Lwetitfunywa taseMhlambanyatsi"
      },
      subtitle: {
        en: "Rural Church Planting & Community Aid",
        ss: "Kusita letinye tindzawo letikhashane"
      },
      image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=70&w=600&fm=webp",
      stats: {
        en: "Completed 3 major rural mission trips to plant and support fellowships.",
        ss: "Titfunywa letintsatfu tihambisile kutilisita emasontfo laseluhlangeni."
      },
      description: {
        en: "Sending short-term mission teams to rural Swazi communities to conduct children's Bible camps, repair structures, and host open-air revival services.",
        ss: "Kutfumela emacembu lamancane emagqumeni kute kufundziswe bantfwana, kulungiswe tindlu letidzala, nemibutsano yekuvuselela."
      },
      successStory: {
        title: {
          en: "Joy in the Rural Mountains",
          ss: "Injabulo Emagqumeni Lasemaphandleni"
        },
        quote: {
          en: "“We felt forgotten, but the church team brought the love of Christ in actions.”",
          ss: "“Besicabanga kutsi sikhohliwe, kambe lelicembu lisikhombisile lutsandvo lwemisebenti lwaKrestu.”"
        },
        narrative: {
          en: "During our latest mission to Mhlambanyatsi, we repaired a damaged roof for a community center and hosted a three-day children's camp. More than 80 rural children received educational books and winter jackets. The local pastor reported that our active service doubled their church attendance as community members witnessed faith demonstrated through hard work.",
          ss: "Ngemphilo yetitfunywa taseMhlambanyatsi, satfole ku-phahla kabusha indlu yemdzala wetindzaba lapho kuhlanganelwa khona. Bantfwana labasiphohlo batfola tincwadzi netingubo tekushisa, futsi netinkolo tendzawo tinyenti kakhulu nyalo."
        }
      },
      opportunity: {
        en: "Join our next team in physical repair work, children's ministry, preaching, or medical assistance.",
        ss: "Menywa ekwakheni kabusha, ekufundziseni bantfwana, ekushumayeleni, nobe kuleminye imisebenti yetandla."
      },
      availableRoles: ["Children's Program Facilitator", "Carpenter/Builder", "Outreach Speaker", "First Aid Assistant"]
    }
  ];

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteerProject) return;
    if (!volunteerName || !volunteerEmail || !volunteerRole) {
      setFormError(language === "en" ? "Please fill in all required fields." : "Sicela ufake yonke imininingwane ledzingekile.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/outreach/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: volunteerName,
          email: volunteerEmail,
          phone: volunteerPhone,
          projectId: selectedVolunteerProject.id,
          projectTitle: selectedVolunteerProject.title[language],
          role: volunteerRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Submission failed.");
      } else {
        setFormSuccess(
          language === "en" 
            ? `Thank you, ${volunteerName}! Your registration to serve with the "${selectedVolunteerProject.title[language]}" team has been received. We will contact you soon!`
            : `Ngiyabonga, ${volunteerName}! Simemelo sakho sekusita elibandleni ngaphasi kwe "${selectedVolunteerProject.title[language]}" sesemukelwe. Sitokutsintsa madvutane!`
        );
        setVolunteerName("");
        setVolunteerEmail("");
        setVolunteerPhone("");
        setVolunteerRole("");
        setTimeout(() => {
          setSelectedVolunteerProject(null);
          setFormSuccess(null);
        }, 4000);
      }
    } catch (err) {
      setFormError("Server error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="community-outreach">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {language === "en" ? "Community Outreach" : "Imisebenti Yekusita"}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
        <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed">
          {language === "en" 
            ? "We believe in demonstrating God's love through tangible acts of kindness, empowerment, and spiritual care. Join us in making a real difference in the hills of Mbabane and beyond."
            : "Sikholelwa ekukhombiseni lutsandvo lwaNkulunkulu ngetandla letibambekako nemisebenti yelutsandvo. Hlanganyela natsi kute sikhulise emandla emagqumeni aseFonteyn naseMbabane."}
        </p>
      </div>

      {/* Impact Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              {stat.icon}
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                {stat.icon}
              </div>
              <h4 className="font-mono text-3xl font-extrabold text-primary-950 tracking-tight">{stat.number}</h4>
            </div>
            <h5 className="font-heading font-bold text-sm text-primary-900">{stat.label[language]}</h5>
            <p className="text-slate-500 font-sans text-xs mt-1 leading-relaxed">{stat.description[language]}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories Grid Switcher */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider border transition-all ${
              selectedCategory === cat
                ? "bg-primary-900 border-primary-900 text-white shadow-md transform scale-[1.02]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {categoryTranslations[cat][language]}
          </button>
        ))}
      </div>

      {/* Projects Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badge */}
                <div className="h-60 sm:h-64 relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title[language]} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 pointer-events-none" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gold-500 text-primary-950 text-[10px] font-heading font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                      {categoryTranslations[project.category][language]}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white leading-tight drop-shadow-sm">
                      {project.title[language]}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-2 text-teal-600 bg-teal-50 border border-teal-100/50 p-3 rounded-2xl">
                    <TrendingUp className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <p className="font-sans text-xs font-semibold leading-relaxed">
                      {project.stats[language]}
                    </p>
                  </div>

                  <p className="text-slate-600 font-sans text-sm leading-relaxed">
                    {project.description[language]}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSelectedStory(project)}
                  className="flex-1 bg-white hover:bg-slate-100 text-primary-950 border border-slate-200 font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>{language === "en" ? "Read Success Story" : "Funda Bufakazi"}</span>
                </button>
                <button
                  onClick={() => setSelectedVolunteerProject(project)}
                  className="flex-1 bg-primary-900 hover:bg-primary-850 text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
                >
                  <Heart className="h-4 w-4 text-gold-400 fill-gold-400" />
                  <span>{language === "en" ? "Volunteer to Serve" : "Titsandzele Kusita"}</span>
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-sans">
              {language === "en" ? "No active projects found in this category." : "Kute tinhlelo letitfolakalako kulesigaba."}
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: SUCCESS STORY LIGHTBOX */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all z-10"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="h-56 relative overflow-hidden">
                <img 
                  src={selectedStory.image} 
                  alt={selectedStory.title[language]} 
                  loading="lazy"
                  className="w-full h-full object-cover pointer-events-none" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-gold-500 text-primary-950 text-[9px] font-heading font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-full mb-2 inline-block shadow-sm">
                    {categoryTranslations[selectedStory.category][language]}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-white drop-shadow-sm leading-tight">
                    {selectedStory.successStory.title[language]}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Beautiful quote card */}
                <div className="bg-amber-50/50 border-l-4 border-gold-500 p-5 rounded-r-2xl italic text-slate-700 font-sans text-sm leading-relaxed">
                  {selectedStory.successStory.quote[language]}
                </div>

                <div className="space-y-4">
                  <h4 className="font-heading font-extrabold text-primary-950 text-sm uppercase tracking-wider">
                    {language === "en" ? "Outreach Narrative" : "Luhlu lwembiko wekuphumelela"}
                  </h4>
                  <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {selectedStory.successStory.narrative[language]}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="bg-primary-950 hover:bg-primary-900 text-white font-heading font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {language === "en" ? "Close Story" : "Vala Umbiko"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INTERACTIVE VOLUNTEER REGISTRATION FORM */}
      <AnimatePresence>
        {selectedVolunteerProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-primary-950 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative text-white border border-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedVolunteerProject(null);
                  setFormSuccess(null);
                  setFormError(null);
                }}
                className="absolute top-4 right-4 bg-primary-900/60 hover:bg-primary-800 text-primary-300 p-2.5 rounded-full transition-all z-10"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="p-6 sm:p-8 space-y-6 relative">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <Heart className="w-48 h-48 text-white" />
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center space-x-2 text-gold-400">
                    <Heart className="h-5 w-5 fill-gold-400" />
                    <span className="font-heading font-extrabold text-[10px] uppercase tracking-widest bg-primary-900 px-2.5 py-1.5 rounded-md border border-slate-800">
                      {categoryTranslations[selectedVolunteerProject.category][language]}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl">
                    {language === "en" ? "Volunteer with Us" : "Titsandzele Natsi"}
                  </h3>
                  <p className="text-primary-200 font-sans text-xs sm:text-sm">
                    {language === "en" 
                      ? `Fill out this form to join the "${selectedVolunteerProject.title.en}" team.`
                      : `Gcwalisa lelifomu kute uhlanganyele nemkhankhaso we "${selectedVolunteerProject.title.ss}".`}
                  </p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleVolunteerSubmit} className="space-y-4 relative z-10 text-slate-100">
                  <div className="bg-primary-900/40 p-4 border border-slate-850 rounded-2xl space-y-2">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-gold-400">
                      {language === "en" ? "Opportunity Highlight" : "Luhla lwekusita"}
                    </h4>
                    <p className="text-xs text-primary-200 font-sans leading-relaxed">
                      {selectedVolunteerProject.opportunity[language]}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-extrabold uppercase tracking-widest text-primary-300 mb-1.5">
                      {language === "en" ? "Full Name" : "Ligama Naliboleko"} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 h-4.5 w-4.5" />
                      <input
                        type="text"
                        required
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        placeholder="e.g. Sipho Dlamini"
                        className="w-full pl-11 pr-4 py-3 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-heading font-extrabold uppercase tracking-widest text-primary-300 mb-1.5">
                        {language === "en" ? "Email Address" : "I-imeyili"} *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 h-4.5 w-4.5" />
                        <input
                          type="email"
                          required
                          value={volunteerEmail}
                          onChange={(e) => setVolunteerEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-11 pr-4 py-3 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-heading font-extrabold uppercase tracking-widest text-primary-300 mb-1.5">
                        {language === "en" ? "Phone (Optional)" : "Sicingo"}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 h-4.5 w-4.5" />
                        <input
                          type="tel"
                          value={volunteerPhone}
                          onChange={(e) => setVolunteerPhone(e.target.value)}
                          placeholder="+268 7600 0000"
                          className="w-full pl-11 pr-4 py-3 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-heading font-extrabold uppercase tracking-widest text-primary-300 mb-1.5">
                      {language === "en" ? "Prefered Service Role" : "Sikhundla Sekusita"} *
                    </label>
                    <select
                      required
                      value={volunteerRole}
                      onChange={(e) => setVolunteerRole(e.target.value)}
                      className="w-full px-4 py-3 bg-primary-900/80 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                    >
                      <option value="" disabled className="bg-primary-950 text-primary-400">
                        {language === "en" ? "-- Choose a role --" : "-- Khetsa sikhundla --"}
                      </option>
                      {selectedVolunteerProject.availableRoles.map((role, rIdx) => (
                        <option key={rIdx} value={role} className="bg-primary-950 text-white">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-primary-950 font-heading font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 mt-4"
                  >
                    <span>{submitting ? (language === "en" ? "Submitting..." : "Kuyahamba...") : (language === "en" ? "Submit Registration" : "Hambisa Simemetelo")}</span>
                  </button>
                </form>

                {/* Notifications */}
                <AnimatePresence>
                  {formSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-4 rounded-xl flex items-start space-x-2 animate-fade-in relative z-10"
                    >
                      <Check className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="font-sans text-xs leading-relaxed">{formSuccess}</p>
                    </motion.div>
                  )}
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 bg-rose-500/20 text-rose-300 border border-rose-500/30 p-4 rounded-xl flex items-start space-x-2 animate-fade-in relative z-10"
                    >
                      <X className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="font-sans text-xs leading-relaxed">{formError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
