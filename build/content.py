# Content for the Zyeta concept site. Facts come from zyeta.com and the earlier demo site.
# Nothing here is invented: where a fact was not available it is left out.

PROJECTS = [
    dict(slug='linkedin-bengaluru', name='Magnetic Metamorphosis', short='LinkedIn',
         sub='Crafting a high-performance space for high-impact transformation',
         client='LinkedIn', city='Bengaluru, India', year='2025',
         floor='Reception, work neighbourhoods and a full-height mural',
         brief=['LinkedIn, the global professional network, set out to build a Bengaluru facility that would stand as evidence for employee experience and wellbeing.',
                'Zyeta worked the brief as Magnetic Metamorphosis: a workplace designed to pull people in rather than instruct them, with the design narrative carrying through reception, work neighbourhoods and the shared floor.'],
         img='linkedinbengaluruworkplacedesign', bg='#4A3B34'),
    dict(slug='iff-hyderabad', name='A sensescape where science inhabits spatial poetry', short='IFF',
         sub='Science, held in a spatial poem',
         client='IFF Global Business Services', city='Hyderabad, India', year='2025',
         floor='75,000 square feet of sensescaping for 600+ people',
         brief=['IFF is a century-old name in flavours, fragrances and biosciences. Its Global Business Services hub in Hyderabad was briefed with sensory purpose rather than headcount.',
                'Zyeta answered with a 75,000 square foot immersive sensescape, a spatial journey built to be walked, felt and discovered by more than 600 people.'],
         img='iffhyderabad', bg='#4B4A43'),
    dict(slug='seven-eleven-phase-2', name='Cars of 7-Eleven', short='7-Eleven',
         sub='A collision of punk, velocity and utopian spatial expression',
         client='7-Eleven Global Solution Centre', city='Bengaluru, India', year='2025',
         floor='Second facility for the same client',
         brief=["After The Urban Playground, 7-Eleven's Global Solution Centre came back to Zyeta for a bolder second facility in Bengaluru.",
                'The design borrows from the global Cars of 7-Eleven subculture and turns it into an experiential ecosystem, reworking the relationship between office, employee and brand.'],
         img='7elevenphase2', bg='#4A1D1F'),
    dict(slug='seven-eleven-bengaluru', name='The Urban Playground', short='7-Eleven',
         sub='A workplace that earns the commute',
         client='7-Eleven Global Solution Centre', city='Bengaluru, India', year='2024',
         floor='The first facility for the client',
         brief=['The first 7-Eleven Global Solution Centre facility in Bengaluru set the register the second phase was built against.',
                'The floor mixes breakout areas with planting and artificial grass, a dark neon-lit lounge, a cafeteria with a mural, and work settings that shift from a shared table to a booth in a few steps.'],
         img='7elevenbengaluru', bg='#263129'),
    dict(slug='tdcx-hyderabad', name='Regional Sensibilities', short='TDCX',
         sub='Infusing regional sensibilities to nurture a resilient and collaborative workplace',
         client='TDCX', city='Hyderabad, India', year='2025',
         floor='Regional identity on a high-occupancy floor',
         brief=['TDCX is a digital transformation and outsourcing partner, and its Hyderabad hub is a high-occupancy floor where the mood of the room does the retention work.',
                'Zyeta drew the local register into the scheme: pattern, colour and mural work that belongs to the region, applied to a floor that also has to be resilient under heavy daily use.'],
         img='tdcxasiasleadingdigitaltransformat', bg='#3F3A33'),
]

STAGES = ['Strategy and space planning', 'Design', 'MEP and networking', 'Build', 'Furniture', 'Commissioning', 'Handover']

SERVICES = [
    dict(slug='design-and-build', name='Design and Build', line='One team, from first drawing to handover',
         img='design-build', alt='A Zyeta lounge with a coral sofa and a timber screen', related='iff-hyderabad',
         intro='Delivered work runs from strategy and space planning through MEP and networking design to build, furniture and commissioning. A Client Success Officer is your single point of contact from kickoff to handover.',
         inc=['Strategy and space planning', 'Interior design and documentation', 'MEP and networking design', 'Build and fit-out', 'Furniture', 'Commissioning and handover', 'One Client Success Officer from kickoff to handover'],
         stat=('45', 'days', 'standard turnaround under ideal conditions'), stages=[0, 1, 2, 3, 4, 5, 6]),
    dict(slug='design-consultancy', name='Design Consultancy', line='Workspaces that command growth',
         img='design-consultancy', alt='A Zyeta cafeteria with long tables and red booths', related='linkedin-bengaluru',
         intro='Zyeta blends design thinking with a regional reading of how each market actually works, and turns it into a workplace that carries the brand across locations.',
         inc=['Concept and design development', 'A regional reading of each market', 'HQ standards turned into local design playbooks', 'Brand identity carried across locations'],
         stat=None, stages=[0, 1]),
    dict(slug='workplace-strategy', name='Workplace Strategy', line='The evidence before the drawing',
         img='workplacestrategy-1', alt='A Zyeta breakout with planting and high tables', related='tdcx-hyderabad',
         intro='It covers change management and culture change after mergers, utilisation studies, remote and hybrid patterns, and the safety, security and space questions that boards now ask first.',
         inc=['Change management and culture change after mergers', 'Utilisation studies', 'Remote and hybrid work patterns', 'Safety, security and space planning'],
         stat=('186', '+', 'workplace projects delivered'), stages=[0]),
    dict(slug='well-consultation', name='WELL Consultation', line='Health designed in, then certified',
         img='well-consultancy', alt='A Zyeta lounge with a round red rug and low seating', related='iff-hyderabad',
         intro='Zyeta keeps an in-house team of WELL Accredited Professionals. They integrate the WELL building standard into the design itself rather than auditing it afterwards, and they stay with the project from registration through to the rating.',
         inc=['In-house WELL Accredited Professionals', 'The WELL standard built into the design', 'Support from registration through to the rating'],
         stat=None, stages=[0, 1, 5]),
    dict(slug='well-health-safety-rating', name='WELL Health-Safety Rating', line='A floor people will come back to',
         img='well-hsr-consultancy', alt='A Zyeta lounge with a long grey sofa and red chairs', related='seven-eleven-bengaluru',
         intro="Zyeta's in-house WELL Accredited Professionals take the rating end to end: employee wellbeing policy, stakeholder engagement, air and water quality regulation, and the documentation that supports each claim.",
         inc=['Employee wellbeing policy', 'Stakeholder engagement', 'Air and water quality regulation', 'Documentation for every claim'],
         stat=None, stages=[5, 6]),
    dict(slug='sustainability-consultancy', name='Sustainability Consultancy', line='Net zero made an engineering problem',
         img='sustainabilityconsultancy-1', alt='A planted Zyeta work floor with hanging greenery', related='seven-eleven-phase-2',
         intro='Delivered through Zyeta PURE, the sustainability division. It covers green building certification, Life Cycle Assessment for buildings and materials, embodied carbon tracking, and the energy, water and waste programmes that follow occupancy.',
         inc=['Green building certification: WELL, LEED and IGBC', 'Life Cycle Assessment for buildings and materials', 'Embodied carbon tracking', 'Energy, water and waste programmes after occupancy', 'Post-occupancy reporting'],
         stat=('2', 'M+', 'square feet of LEED and WELL certified projects'), stages=[0, 1, 6]),
]

ATTRS = [
    ('Thought leadership', 'Zyeta tracks global trends in workplace excellence, workforce dynamics and environmental practice, and brings them into every project.'),
    ('Technology investment', 'BIM, cloud-enabled renders and virtual reality make a floor visible before it is built, and cut cycle time and cost. Zyeta was the first firm of its kind in India to use them.'),
    ('Integrated capabilities', 'One source runs the whole project, MEP and networking design included, so there is no vendor finger-pointing.'),
    ('Safety commitment', 'Safety training is built into every project, from final design through build-out.'),
    ('Sustainability mandate', 'Less water and energy, recycled materials, and suppliers held to the same standard.'),
    ('People', 'Architects, engineers and designers, trained continuously on new technology.'),
]

NUMBERS = [('27', 'M+', '', 'Square feet delivered'), ('80', '%', '', 'Cost accuracy with BIM'),
           ('2', 'M+', '', 'Square feet of LEED and WELL certified projects'), ('3', '', '#', 'Worldwide, Giants of Design Survey 2026')]

PEOPLE = [
    ('Shilpa Revankar', 'Founder'), ('Amit Prakash', 'Co-founder and board member'),
    ('Payal Sandhu Khurana', 'Global Director of Design and Strategy'), ('Magam Siva Krishna', 'Chief Creative Officer'),
    ('Madhusudhan Hampanna', 'Chief Financial Officer'), ('Kishore Manoharan', 'Design Head'),
    ('Smitha Naik Deshpande', 'Design Regional Director'), ('Harvey Lopez', 'VP Design Standards and Modularity'),
    ('Arun Ponniah', 'VP Creative Engineering and Standards'), ('Arpit Bansal', 'Business Development Senior Director'),
    ('Amit Sangodkar', 'Business Development Associate Director'), ('Lt Cdr Sushant (Retd.)', 'Director of Operations'),
    ('Rick De', 'Associate Director, Digital Experience'), ('Venu Madhav Rao', 'Associate Director of Design, Quality'),
    ('Shalini Kumari', 'Head of Digital Media'),
]

OFFICES = [
    ('Bengaluru', 'India', 'Ashok Nagar', '+91 63645 99441', 'Asia/Kolkata'),
    ('Chennai', 'India', 'Mylapore', '+91 63645 99441', 'Asia/Kolkata'),
    ('Delhi NCR', 'India', 'Udyog Vihar, Gurugram', '+91 95606 40078', 'Asia/Kolkata'),
    ('Ahmedabad', 'India', 'Ambli', '+91 95606 40078', 'Asia/Kolkata'),
    ('Hyderabad', 'India', 'Madhapur', '+91 63645 99441', 'Asia/Kolkata'),
    ('Kochi', 'India', 'Kakkanad', '+91 63645 99441', 'Asia/Kolkata'),
    ('Mumbai', 'India', 'Powai', '+91 63645 99441', 'Asia/Kolkata'),
    ('Pune', 'India', 'Koregaon Park', '+91 63645 99441', 'Asia/Kolkata'),
    ('Singapore', 'Singapore', 'Orchard Road', '+65 9667 8801', 'Asia/Singapore'),
    ('Kuala Lumpur', 'Malaysia', 'Bangsar South', '+60 111 627 6197', 'Asia/Kuala_Lumpur'),
    ('Hong Kong', 'Hong Kong', 'Tsim Sha Tsui', '+65 9667 8801', 'Asia/Hong_Kong'),
    ('Taipei', 'Taiwan', 'Xinyi District', '+65 9667 8801', 'Asia/Taipei'),
]

INSIGHTS = [
    ('Blog', '28 October 2026', '05 ESG imperatives for media and entertainment GCCs in India, and how to design for them', 'data-driven-workplace-design-firm', 'https://www.zyeta.com/blogs/05-esg-imperatives-for-media-and-entertainment-gccs-in-india-and-how-to-design-for-them/'),
    ('Case study', 'IFF, Hyderabad', "A sensescape of innovation: inside IFF's Hyderabad GBS hub", 'iffhyderabad-3', 'https://www.zyeta.com/case-study/iff-hyderabad-gbs-hub-sensory-workplace-design/'),
    ('Blog', '6 October 2026', 'How can GCCs in Asia set up efficient, business-ready product and AI development hubs?', 'global-capability-centers-gccs-in-asia', 'https://www.zyeta.com/blogs/how-can-gccs-in-asia-set-up-efficient-business-ready-product-and-ai-development-hubs/'),
    ('Blog', '9 September 2026', 'Is your workplace AI-ready? Designing infrastructure that scales with intelligence', 'ai-in-office-interior-design-1', 'https://www.zyeta.com/blogs/ai-ready-workplace/'),
    ('Case study', 'Workplace design', 'The dynamic workplace: fluid, flexible and future ready', 'careers-5', 'https://www.zyeta.com/case-study/the-dynamic-workplace-fluid-flexible-and-future-ready/'),
    ('Blog', '8 July 2026', '07 design strategies you need to build a carbon-neutral GCC office', 'carbon-neutral-gcc-office', 'https://www.zyeta.com/blogs/07-design-strategies-you-need-to-build-a-carbon-neutral-gcc-office/'),
    ('Case study', 'Confidential project', 'Exemplifying success through workplace design after a merger', 'design-and-technology-firm-2-scaled', 'https://www.zyeta.com/case-study/successful-post-merger-workplace-design-strategy/'),
    ('Blog', '24 June 2026', 'How is Japandi redefining workplace design in Asia?', 'office-lounge', 'https://www.zyeta.com/blogs/how-is-japandi-design-redefining-workspace-design-in-southeast-asia/'),
    ('Blog', '10 June 2026', 'How Singapore workplaces must adapt to new carbon mandates in 2026', 'sustainability-service', 'https://www.zyeta.com/blogs/how-singapore-workplaces-must-urgently-adapt-to-new-carbon-mandates-in-2026/'),
    ('Report', 'Research paper', 'A future of work chronicle', 'worklife-1', 'https://www.zyeta.com/report/the-future-of-work-chronicle/'),
    ('Report', 'Research paper', 'Decoding organisational culture', 'people-zyeta-employees-bangalore', 'https://www.zyeta.com/report/decoding-organisational-culture/'),
    ('Report', 'Special report', 'Predictions for the future workplace', 'best-office-interior-design-company-1', 'https://www.zyeta.com/insights/special-report-2021-prediction-future-workplace/'),
]

FAQS = [
    ('Do you handle statutory approvals and compliance?', 'Yes. Approvals, compliance and regulatory coordination are handled within project scope across India and APAC, including local codes, fire safety and EHS standards.'),
    ("We have global standards to follow. Can you align with our HQ's guidelines?", "Yes. Zyeta runs workshops to understand your HQ standards, builds a custom design playbook, and adapts the global brand to local regulations."),
    ('Will I have a dedicated point of contact during the project?', 'Yes. A Client Success Officer is assigned at kickoff and handles communication, progress updates and escalation.'),
    ('Do you have an in-house team across locations?', 'Yes. In-house teams work from India, Singapore, Taiwan, Hong Kong and Malaysia, with partner studios and real estate professionals in the UK, Europe and elsewhere.'),
    ('How do you build sustainability into workplace design?', 'Through Zyeta PURE, the sustainability division: WELL, LEED and IGBC certified spaces, carbon tracking, and post-occupancy reporting led by accredited experts.'),
    ('How long does an office design and build project take?', 'About 45 days under ideal conditions. Timelines change with scope and complexity.'),
    ('What industries do you design for?', 'Workplaces of every kind, plus life sciences laboratories built to GMP, ISO, NABL and EHS standards.'),
    ('Can you work with existing buildings?', 'Yes. Zyeta retrofits, revamps, extends and renovates existing workspaces as well as building new ones.'),
    ('How do you keep projects on time and on budget?', 'Budgets are locked early through detailed planning and vendor commitments. Progress is tracked with governance frameworks and dashboards, and BIM and digital twin tools monitor time and cost.'),
]

CAREERS = [
    ('Inspiring work', 'Global trends in workspace design, workforce dynamics and environmental practice, applied to real floors.'),
    ('A tight-knit team', 'Big enough for large projects, small enough that your work is seen.'),
    ('Ingenious minds', 'Designers and technologists work together from concept through completion.'),
    ('Creative and technical', 'A safety-first culture runs through every project, from final design to build-out.'),
]
