import { Quiz } from "../types";

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-pn-trans",
    title: "Pneumatic Transmission Basic ⚙️",
    category: "Pneumatic Transmission",
    paragraph: "Pneumatic transmission systems use pressurized gas, typically compressed air, to transmit and control power in mechanical applications. Key components include an air compressor to increase pressure, a receiver tank for storage, filter-regulator-lubricator (FRL) units for conditioning, directional control valves to guide flow, and cylinders/actuators to perform work. Because air is compressible and readily available, pneumatics offers safe, clean, reliable, and high-speed linear motion, although it is less efficient for heavy forces compared to hydraulic transmissions.",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q-pn-1",
        text: "What medium is primarily used in pneumatic transmission systems to transmit power?",
        choices: ["Hydraulic oil", "Water", "Compressed air or gas", "Electricity"],
        correctAnswer: "Compressed air or gas",
        explanation: "Pneumatic systems use pressurized gas, usually compressed air, as their working fluid to transmit mechanical energy.",
        points: 1
      },
      {
        id: "q-pn-2",
        text: "Which component is responsible for increasing the pressure of the air in a pneumatic system?",
        choices: ["Air compressor", "Receiver tank", "Actuator", "Directional valve"],
        correctAnswer: "Air compressor",
        explanation: "The air compressor takes in ambient air and compresses it to increase its pressure for use in the system.",
        points: 1
      },
      {
        id: "q-pn-3",
        text: "What does the abbreviation 'FRL' stand for in pneumatics?",
        choices: ["Flow-Rate-Limit", "Filter-Regulator-Lubricator", "Fluid-Resistance-Line", "Fast-Release-Lever"],
        correctAnswer: "Filter-Regulator-Lubricator",
        explanation: "FRL stands for Filter, Regulator, and Lubricator, which cleans, regulates, and lubricates compressed air.",
        points: 1
      },
      {
        id: "q-pn-4",
        text: "Which component is used for storing compressed air to stabilize system pressure?",
        choices: ["Actuator cylinder", "Receiver tank", "Exhaust silencer", "Pressure gauge"],
        correctAnswer: "Receiver tank",
        explanation: "A receiver tank acts as storage to handle peek demand and dampens pressure pulsations from the compressor.",
        points: 1
      },
      {
        id: "q-pn-5",
        text: "Which device is responsible for converting fluid power into linear or rotary mechanical motion?",
        choices: ["Receiver tank", "Compressor", "Actuator or cylinder", "FRL unit"],
        correctAnswer: "Actuator or cylinder",
        explanation: "Actuators (such as cylinders and motors) convert the energy of compressed air into mechanical work.",
        points: 1
      },
      {
        id: "q-pn-6",
        text: "What is a major advantage of pneumatic systems over hydraulic systems?",
        choices: ["They can handle much heavier forces", "They are highly quiet and completely silent", "They offer safe, clean, and high-speed linear motion", "They do not require any maintenance"],
        correctAnswer: "They offer safe, clean, and high-speed linear motion",
        explanation: "Pneumatic systems are safe, clean, cannot spark, and provide rapid responses and fast linear movements.",
        points: 1
      },
      {
        id: "q-pn-7",
        text: "What is the primary function of a directional control valve?",
        choices: ["To filter dust from air", "To guide and direct air flow to specific system paths", "To lubricate cylinders", "To measure pressure levels"],
        correctAnswer: "To guide and direct air flow to specific system paths",
        explanation: "Directional control valves adjust, open, or close passage routes to control where pressurized air flows.",
        points: 1
      },
      {
        id: "q-pn-8",
        text: "Why is pneumatics less suited for extremely heavy load applications than hydraulics?",
        choices: ["Air is highly compressible", "Compressed air is too expensive", "Pneumatic components are too heavy", "Air has no safety limits"],
        correctAnswer: "Air is highly compressible",
        explanation: "Air's compressibility makes it difficult to maintain precise positioning under massive or changing loads, unlike rigid hydraulic oil.",
        points: 1
      },
      {
        id: "q-pn-9",
        text: "In pneumatics, what unit is typically used to clean, control pressure, and lubricate the air?",
        choices: ["Unloader valve", "Manifold unit", "FRL unit", "Check valve"],
        correctAnswer: "FRL unit",
        explanation: "The FRL (Filter-Regulator-Lubricator) prepares the air before it reaches control valves and actuators.",
        points: 1
      },
      {
        id: "q-pn-10",
        text: "Which component actually carries out the mechanical work in pneumatic systems?",
        choices: ["FRL unit", "Compressor", "Receiver tank", "Actuator"],
        correctAnswer: "Actuator",
        explanation: "The actuator is the final output unit that utilizes fluid pressure to move loads and perform work.",
        points: 1
      }
    ]
  },
  {
    id: "quiz-tpm",
    title: "Total Productive Maintenance (TPM) 🛠️",
    category: "TPM",
    paragraph: "Total Productive Maintenance (TPM) is a holistic approach to equipment upkeep that strives to achieve perfect production with zero breakdowns, zero slow-downs, and zero accidents. Developed in Japan, TPM is built on eight foundational pillars, with Autonomous Maintenance (Jishu Hozen) being central, empowering operators to maintain their own machinery. By introducing proactive and preventative techniques, TPM maximizes overall equipment effectiveness (OEE) and fosters a culture of shared responsibility between operators and maintenance teams.",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q-tpm-1",
        text: "What is the ultimate target of a Total Productive Maintenance (TPM) system?",
        choices: ["Zero breakdowns, zero slow-downs, and zero accidents", "To double the size of the maintenance staff", "To eliminate the need for equipment operators", "To fully automate all quality control audits"],
        correctAnswer: "Zero breakdowns, zero slow-downs, and zero accidents",
        explanation: "TPM aims for the ideal state of manufacturing: zero failures, zero stoppages, and zero injuries.",
        points: 1
      },
      {
        id: "q-tpm-2",
        text: "Where was Total Productive Maintenance (TPM) originally developed?",
        choices: ["The United States", "Germany", "Japan", "The United Kingdom"],
        correctAnswer: "Japan",
        explanation: "TPM was developed in Japan (spearheaded by the Japan Institute of Plant Maintenance) to enhance manufacturing stability.",
        points: 1
      },
      {
        id: "q-tpm-3",
        text: "How many foundational pillars is TPM typically built upon?",
        choices: ["Three pillars", "Five pillars", "Eight pillars", "Twelve pillars"],
        correctAnswer: "Eight pillars",
        explanation: "TPM is traditionally supported by eight pillars focusing on various proactive techniques (e.g., Kobetsu Kaizen, Jishu Hozen, etc.).",
        points: 1
      },
      {
        id: "q-tpm-4",
        text: "Autonomous Maintenance is also commonly known by which Japanese term?",
        choices: ["Jishu Hozen", "Kaizen", "Poka-Yoke", "Heijunka"],
        correctAnswer: "Jishu Hozen",
        explanation: "Jishu Hozen translates directly to 'Autonomous Maintenance' or self-maintenance by equipment operators.",
        points: 1
      },
      {
        id: "q-tpm-5",
        text: "Which pillar empowers machine operators to perform basic daily cleaning, lubricating, and checking on their own gear?",
        choices: ["Planned Maintenance", "Autonomous Maintenance", "Quality Maintenance", "Training & Education"],
        correctAnswer: "Autonomous Maintenance",
        explanation: "Autonomous Maintenance puts basic upkeep responsibility on frontline operators to detect and prevent deterioration early.",
        points: 1
      },
      {
        id: "q-tpm-6",
        text: "TPM aims to maximize which key performance indicator of factory machinery?",
        choices: ["Overall Equipment Effectiveness (OEE)", "Mean Time to Repair (MTTR)", "Return on Equity (ROE)", "Total Cost of Goods Sold (COGS)"],
        correctAnswer: "Overall Equipment Effectiveness (OEE)",
        explanation: "OEE measures availability, performance, and quality, making it the central metric for tracking TPM success.",
        points: 1
      },
      {
        id: "q-tpm-7",
        text: "Who shares the responsibility of equipment upkeep in a mature TPM culture?",
        choices: ["Only the outside contract technicians", "Only the equipment manufacturing vendor", "Both operators and maintenance teams", "Only the department manager"],
        correctAnswer: "Both operators and maintenance teams",
        explanation: "TPM fosters shared ownership where operators perform basic care, and technical maintenance teams manage complex actions.",
        points: 1
      },
      {
        id: "q-tpm-8",
        text: "What type of maintenance technique does TPM primarily rely on?",
        choices: ["Reactive maintenance after catastrophic failure", "Proactive and preventative techniques", "Simulated virtual maintenance only", "Outsourced on-demand repairs"],
        correctAnswer: "Proactive and preventative techniques",
        explanation: "TPM emphasizes preventing issues before they occur to eliminate breakdowns altogether.",
        points: 1
      },
      {
        id: "q-tpm-9",
        text: "What does the first 'zero' in the three primary TPM objectives stand for?",
        choices: ["Zero delays", "Zero waste", "Zero breakdowns", "Zero paper"],
        correctAnswer: "Zero breakdowns",
        explanation: "Zero breakdowns is the cornerstone objective for equipment reliability and productivity.",
        points: 1
      },
      {
        id: "q-tpm-10",
        text: "Which team works hand-in-hand with operators to establish TPM routines?",
        choices: ["Finance team", "Maintenance teams", "Sales agents", "External auditors"],
        correctAnswer: "Maintenance teams",
        explanation: "Maintenance teams support operators by training them, setting up check sheets, and working on complex improvements.",
        points: 1
      }
    ]
  },
  {
    id: "quiz-plc-basic",
    title: "PLC Basic Concepts 🔌",
    category: "PLC Basic",
    paragraph: "A Programmable Logic Controller (PLC) is an industrial solid-state computer designed to continuously monitor inputs from sensors and make logic-based decisions to control output devices like motors and valves. Standard PLC operations follow a repetitive scan cycle consisting of three main phases: reading input terminal status, executing the programmed control logic, and updating output devices. PLCs are highly robust, noise-resistant, and commonly programmed using Ladder Logic, which visually mimics electrical relay wiring diagrams.",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q-plc-1",
        text: "What does the abbreviation 'PLC' stand for in industrial automation?",
        choices: ["Personal Logic Computer", "Pneumatic Line Controller", "Programmed Logic Circuit", "Programmable Logic Controller"],
        correctAnswer: "Programmable Logic Controller",
        explanation: "PLC stands for Programmable Logic Controller, which is the standard industrial digital computer for automated systems.",
        points: 1
      },
      {
        id: "q-plc-2",
        text: "What are the three main phases of a standard PLC scan cycle in correct order?",
        choices: [
          "Read inputs, execute logic, update outputs", 
          "Update outputs, read inputs, execute logic", 
          "Execute logic, verify syntax, restart cycle", 
          "Compile code, reboot hardware, download logic"
        ],
        correctAnswer: "Read inputs, execute logic, update outputs",
        explanation: "The PLC scan sequence always reads physical inputs, computes the internal logic, and then writes status to biological outputs.",
        points: 1
      },
      {
        id: "q-plc-3",
        text: "Which programming language is most commonly used for PLCs and resembles physical electrical relays?",
        choices: ["C++", "Python", "Ladder Logic", "JavaScript"],
        correctAnswer: "Ladder Logic",
        explanation: "Ladder Logic is the most widely used graphical PLC language, resembling traditional hardwired relay ladder schematics.",
        points: 1
      },
      {
        id: "q-plc-4",
        text: "What type of devices does a PLC continuously monitor through input terminals?",
        choices: ["Sensors and switches", "Motors", "Heater elements", "Solenoid valves"],
        correctAnswer: "Sensors and switches",
        explanation: "Inputs are signals from hardware sensors, pushbuttons, or limits that inform the controller about real-world conditions.",
        points: 1
      },
      {
        id: "q-plc-5",
        text: "Which of the following is considered an output device controlled by a PLC?",
        choices: ["Proximity sensor", "Emergency stop button", "Limit switch", "Motor or solenoid valve"],
        correctAnswer: "Motor or solenoid valve",
        explanation: "Outputs are field actuators like motors, lamps, valves, or relays turned on/off by the PLC logic.",
        points: 1
      },
      {
        id: "q-plc-6",
        text: "What kind of computer is a PLC?",
        choices: ["Desktop supercomputer", "Industrial solid-state computer", "Mainframe server", "Virtual cloud simulator"],
        correctAnswer: "Industrial solid-state computer",
        explanation: "A PLC is a specialized, rugged industrial computer designed for heavy factory environments.",
        points: 1
      },
      {
        id: "q-plc-7",
        text: "During which scan phase does the PLC evaluate the user-written program?",
        choices: ["Read input phase", "Execute logic phase", "Update output phase", "Self-diagnostic check"],
        correctAnswer: "Execute logic phase",
        explanation: "The execute logic phase processes the memory logic instructions loaded by the programmer.",
        points: 1
      },
      {
        id: "q-plc-8",
        text: "Why are PLCs preferred in factory environments over standard household PCs?",
        choices: ["They have bigger screens", "They are highly robust, noise-resistant, and can withstand temperature extremes", "They run video games faster", "They are cheaper than calculators"],
        correctAnswer: "They are highly robust, noise-resistant, and can withstand temperature extremes",
        explanation: "PLCs are built specifically for dirty, noisy, electrically harsh industrial floors and tolerate wide climate ranges.",
        points: 1
      },
      {
        id: "q-plc-9",
        text: "What is the first step of the repetitive PLC operation cycle?",
        choices: ["Updating outputs", "Executing ladder rungs", "Reading physical input terminals", "Checking memory registers"],
        correctAnswer: "Reading physical input terminals",
        explanation: "The PLC starts its scan by copying the voltage values on its physical input pins into memory.",
        points: 1
      },
      {
        id: "q-plc-10",
        text: "In Ladder Logic, the physical representation visually mimics what?",
        choices: ["Flowcharts", "Paragraph text files", "Electrical relay wiring diagrams", "HTML webpage structures"],
        correctAnswer: "Electrical relay wiring diagrams",
        explanation: "Ladder diagrams grew out of electrical relay schematics to make it easy for technicians to transition to PLCs.",
        points: 1
      }
    ]
  },
  {
    id: "quiz-cpu-basic",
    title: "CPU (Central Processing Unit) 💻",
    category: "CPU",
    paragraph: "The Central Processing Unit (CPU) is the primary component of a computer that acts as its brain to execute program instructions. A CPU consists of three core units: the Arithmetic Logic Unit (ALU) which performs math and logical operations, the Control Unit (CU) which directs the flow of signals, and Registers for high-speed temporary storage. Operating through the fundamental instruction cycle of Fetch, Decode, and Execute, the CPU coordinates all hardware components and regulates system processing speed measured in gigahertz clocks.",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q-cpu-1",
        text: "Which component of a computer is commonly referred to as its 'brain'?",
        choices: ["Hard Drive", "Central Processing Unit (CPU)", "Power Supply", "Graphics Card"],
        correctAnswer: "Central Processing Unit (CPU)",
        explanation: "The CPU executes central instructions and handles primary computational commands, acting as the brain of the machine.",
        points: 1
      },
      {
        id: "q-cpu-2",
        text: "Which unit within the CPU is responsible for performing math and logical comparisons?",
        choices: ["Control Unit (CU)", "Arithmetic Logic Unit (ALU)", "Primary Cache", "System Bus"],
        correctAnswer: "Arithmetic Logic Unit (ALU)",
        explanation: "The ALU (Arithmetic Logic Unit) executes mathematical computations (addition, subtraction) and logical instructions (AND, OR, NOT).",
        points: 1
      },
      {
        id: "q-cpu-3",
        text: "What are the three fundamental phases of the CPU instruction cycle in order?",
        choices: [
          "Fetch, Decode, Execute", 
          "Read, Write, Format", 
          "Input, Process, Print", 
          "Compile, Debug, Execute"
        ],
        correctAnswer: "Fetch, Decode, Execute",
        explanation: "The instruction cycle retrieves the command from memory ('Fetch'), translates it ('Decode'), and carries it out ('Execute').",
        points: 1
      },
      {
        id: "q-cpu-4",
        text: "Which unit directs the flow of internal signals and data inside the CPU?",
        choices: ["Arithmetic Logic Unit (ALU)", "Control Unit (CU)", "Liquid Cooler", "Secondary Storage"],
        correctAnswer: "Control Unit (CU)",
        explanation: "The Control Unit acts as the traffic cop of the CPU, directing instructions and coordinating communication between registers and units.",
        points: 1
      },
      {
        id: "q-cpu-5",
        text: "What are the ultra-fast temporary storage locations inside the CPU called?",
        choices: ["Sectors", "Caches only", "Registers", "Virtual RAM blocks"],
        correctAnswer: "Registers",
        explanation: "Registers are small, extremely high-speed memory cells within the CPU itself used to hold immediate instructions and values.",
        points: 1
      },
      {
        id: "q-cpu-6",
        text: "In what units is a modern CPU's clock speed typically measured?",
        choices: ["Megabytes (MB)", "Gigahertz (GHz)", "Milliseconds (ms)", "Watts (W)"],
        correctAnswer: "Gigahertz (GHz)",
        explanation: "CPU clock rate is measured in Gigahertz, denoting billions of electrical cycles processed per second.",
        points: 1
      },
      {
        id: "q-cpu-7",
        text: "Which unit does the CPU use to temporarily store instruction parameters during cycle phases?",
        choices: ["Registers", "Solid State Drive", "Optical drive", "System bus"],
        correctAnswer: "Registers",
        explanation: "Registers hold immediate operational data during the fetch, decode, and execute stages.",
        points: 1
      },
      {
        id: "q-cpu-8",
        text: "The Control Unit (CU) primarily directs the flow of what?",
        choices: ["Liquid coolant", "Signals and data instructions", "Alternating electrical power", "Internet web requests"],
        correctAnswer: "Signals and data instructions",
        explanation: "The CU directs signaling to keep memory, ALU, and inputs/outputs synchronized.",
        points: 1
      },
      {
        id: "q-cpu-9",
        text: "What is the first step in the CPU's instruction cycle?",
        choices: ["Decode", "Execute", "Fetch", "Writeback"],
        correctAnswer: "Fetch",
        explanation: "The CPU first fetches (retrieves) the binary instruction code from computer memory.",
        points: 1
      },
      {
        id: "q-cpu-10",
        text: "What does 'ALU' stand for in microprocessing?",
        choices: ["Automatic Logic Unit", "Arithmetic Logic Unit", "Analog Linear Utility", "Auxiliary Logic Unit"],
        correctAnswer: "Arithmetic Logic Unit",
        explanation: "ALU stands for Arithmetic Logic Unit, the mathematical core design of central processors.",
        points: 1
      }
    ]
  },
  {
    id: "quiz-temp-1",
    title: "Photosynthesis 🌱",
    category: "Science",
    paragraph: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness celestial sunlight and convert it into chemical energy. During this biochemical reaction, carbon dioxide and water are combined to synthesize glucose molecules, releasing oxygen gaseous molecules as an essential byproduct. This magical reaction primarily takes place inside specialized organelles called chloroplasts, which contain pigment chlorophyll.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    questions: [
      {
        id: "q-tp1-1",
        text: "Which of the following organelles converts sunlight into chemical energy during photosynthesis?",
        choices: ["Mitochondria", "Chloroplasts", "Nucleus", "Ribosomes"],
        correctAnswer: "Chloroplasts",
        explanation: "Chloroplasts are specialized structures containing chlorophyll that play a key role in photosynthesis.",
        points: 1
      },
      {
        id: "q-tp1-2",
        text: "What vital byproduct is chemically released during the photosynthetic process?",
        choices: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
        correctAnswer: "Oxygen",
        explanation: "Oxygen gaseous molecules are emitted as essential secondary byproducts of water photolysis during photosynthesis.",
        points: 1
      },
      {
        id: "q-tp1-3",
        text: "Which molecules are chemically combined with water to synthesize glucose?",
        choices: ["Methane", "Carbon dioxide", "Carbon monoxide", "Glucose itself"],
        correctAnswer: "Carbon dioxide",
        explanation: "During light-independent reactions, carbon dioxide chemical molecules are fixed with water to synthesize glucose.",
        points: 1
      },
      {
        id: "q-tp1-4",
        text: "What major light-receptive green pigment is located inside the chloroplasts?",
        choices: ["Hemoglobin", "Carotene", "Anthocyanin", "Chlorophyll"],
        correctAnswer: "Chlorophyll",
        explanation: "Chlorophyll is the distinct green coloring pigment that captures light rays for conversion under plants.",
        points: 1
      },
      {
        id: "q-tp1-5",
        text: "What form of chemical energy is primarily synthesized during photosynthesis?",
        choices: ["Glucose", "Starch only", "Water vapor", "ATP energy only"],
        correctAnswer: "Glucose",
        explanation: "Glucose acts as the direct carbohydrate sugar molecular sugar storage formed from standard carbon dioxide capture.",
        points: 1
      },
      {
        id: "q-tp1-6",
        text: "Which of the following is NOT required for standard photosynthesis?",
        choices: ["Sunlight", "Water", "Carbon Dioxide", "Argon Gas"],
        correctAnswer: "Argon Gas",
        explanation: "Argon is an inert noble gas and has no chemical involvement in standard plant photosynthesis.",
        points: 1
      },
      {
        id: "q-tp1-7",
        text: "Photosynthesis is utilized by which organisms?",
        choices: ["Mammals", "Plants, algae, and certain bacteria", "Fungi and mushrooms", "Strictly deep sea fish"],
        correctAnswer: "Plants, algae, and certain bacteria",
        explanation: "These autotrophic organisms synthesize their own food chemically using ambient light.",
        points: 1
      },
      {
        id: "q-tp1-8",
        text: "What color ranges do chlorophyll pigments primarily absorb least?",
        choices: ["Blue light", "Red light", "Green light", "Ultraviolet"],
        correctAnswer: "Green light",
        explanation: "Chlorophyll reflects green wavelength light, which is why most photosynthetic plants look green to humans.",
        points: 1
      },
      {
        id: "q-tp1-9",
        text: "Water is chemically split during photosynthesis to release what element?",
        choices: ["Helium", "Oxygen", "Iron", "Gold"],
        correctAnswer: "Oxygen",
        explanation: "Photolysis splits water molecules to release oxygen gas into the atmosphere.",
        points: 1
      },
      {
        id: "q-tp1-10",
        text: "Photosynthesis converts solar raw energy into which type of energy?",
        choices: ["Nuclear energy", "Kinetic motion", "Chemical energy", "Static magnetic force"],
        correctAnswer: "Chemical energy",
        explanation: "Chemical energy is stored inside the molecular bonds of synthesize carbohydrate sugars.",
        points: 1
      }
    ]
  },
  {
    id: "quiz-temp-2",
    title: "Artificial Intelligence Concepts 🤖",
    category: "Technology",
    paragraph: "Artificial intelligence (AI) represents the simulation of human intelligence processes by computer systems. These actions encompass cognitive learning (the acquisition of raw rules and information for processing), reasoning (using system rules to reach approximate conclusions), and self-correction. Breakthroughs in Deep Learning neural networks have allowed modern AI models to surpass humans in pattern recognition and language processing tasks.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    questions: [
      {
        id: "q-tp2-1",
        text: "What is cognitive learning defined as inside the core Artificial Intelligence processes?",
        choices: ["Designing hardware servers", "The acquisition of raw rules and information for processing", "Deleting legacy databases", "Copying human brains verbatim"],
        correctAnswer: "The acquisition of raw rules and information for processing",
        explanation: "Cognitive learning refers to obtaining patterns, definitions, and rules so AI models can process input data.",
        points: 1
      },
      {
        id: "q-tp2-2",
        text: "Which AI process allows algorithms to use system rules to reach approximate conclusions?",
        choices: ["Reasoning", "Learning", "Self-correction", "Visual drawing"],
        correctAnswer: "Reasoning",
        explanation: "Reasoning focuses on applying rules and models to process constraints and make sound approximate deductions.",
        points: 1
      },
      {
        id: "q-tp2-3",
        text: "What computational breakthroughs have enabled modern AI to surpass human language processing?",
        choices: ["Optical fiber connections", "Deep Learning neural networks", "Superconductors", "Relational SQL indexes"],
        correctAnswer: "Deep Learning neural networks",
        explanation: "Deep neural networks learn abstract parameters from vast datasets, exceeding human baselines in pattern identification.",
        points: 1
      },
      {
        id: "q-tp2-4",
        text: "AI represents standard simulation of which processes by computer devices?",
        choices: ["Animal behaviors", "Chemical elements interactions", "Human intelligence processes", "Cosmic planet coordinates"],
        correctAnswer: "Human intelligence processes",
        explanation: "Artificial intelligence is designed specifically to capture, simulate, and automate human cognitive processes.",
        points: 1
      },
      {
        id: "q-tp2-5",
        text: "What is the third vital AI cognitive step alongside learning and reasoning?",
        choices: ["Direct raw memory storage", "Self-correction", "Database query optimization", "Power distribution regulate"],
        correctAnswer: "Self-correction",
        explanation: "Self-correction enables AI systems to continuously evaluate their accuracy and adjust rules dynamically.",
        points: 1
      },
      {
        id: "q-tp2-6",
        text: "Deep Learning uses systems called which of the following?",
        choices: ["Relational index nodes", "Neural networks", "Binary trees", "Magnetic tape drives"],
        correctAnswer: "Neural networks",
        explanation: "Neural networks are layered computational nodes that simulate neurons to extract patterns.",
        points: 1
      },
      {
        id: "q-tp2-7",
        text: "Which capability have deep learning breakthroughs enabled modern models to exceed human performance?",
        choices: ["Pattern recognition and language processing", "Hardware cooling and clock speeds", "Predicting exact lottery numbers", "Drafting chemical elements"],
        correctAnswer: "Pattern recognition and language processing",
        explanation: "Modern AI systems excel brilliantly in parsing text, translation, and recognizing complex patterns in datasets.",
        points: 1
      },
      {
        id: "q-tp2-8",
        text: "In AI, learning involves the acquisition of rules and what else?",
        choices: ["Electrical signals", "Raw information", "Graphics cards", "Department credits"],
        correctAnswer: "Raw information",
        explanation: "Acquisition of information and rules for using the information are central pillars of AI training.",
        points: 1
      },
      {
        id: "q-tp2-9",
        text: "What does self-correction help AI models accomplish?",
        choices: ["Rebooting hardware", "Continuously tuning and improving their output accuracy", "Accessing external hard-drives", "Slowing down CPU registers"],
        correctAnswer: "Continuously tuning and improving their output accuracy",
        explanation: "By analyzing success rates and feedback loops, models adapt their logic weights to deliver better answers.",
        points: 1
      },
      {
        id: "q-tp2-10",
        text: "Which systems typically run and execute simulated AI models?",
        choices: ["Analog switches", "Computer systems", "Water turbines", "Solar batteries"],
        correctAnswer: "Computer systems",
        explanation: "Artificial intelligence simulations are hosted and processed electronically on computer systems.",
        points: 1
      }
    ]
  }
];
