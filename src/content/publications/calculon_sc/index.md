---
slug: calculon_sc
title: "Calculon: a Methodology and Tool for High-Level Codesign of Systems and Large Language Models"
authors:
  - mikhail-isaev
  - admin
  - larry-dennison
  - richard-vuduc
date: "2023-11-12T00:00:00Z"
type: "1"
venue: In *The International Conference for High Performance Computing, Networking, Storage, and Analysis 2023*
venueShort: In *SC23*
abstract: This paper presents a parameterized analytical performance model of transformer-based Large Language Models (LLMs) for guiding high-level algorithm-architecture codesign studies. This model derives from an extensive survey of performance optimizations that have been proposed for the training and inference of LLMs; the model's parameters capture application characteristics, the hardware system, and the space of implementation strategies. With such a model, we can systematically explore a joint space of hardware and software configurations to identify optimal system designs under given constraints, like the total amount of system memory. We implemented this model and methodology in a Python-based open-source tool called Calculon. Using it, we identified novel system designs that look significantly different from current inference and training systems, showing quantitatively the estimated potential to achieve higher efficiency, lower cost, and better scalability.
summary: We present Calculon, a parameterized analytical performance model and open-source tool for high-level algorithm-architecture codesign of LLM training and inference systems.
tags:
  - Machine Learning
  - Modeling
  - Codesign
doi: 10.1145/3581784.3607102
image: ./featured.png
imageAlt: Bar charts of batch time and HBM memory consumption for running GPT3 175B across 4,096 GPUs with TP=8, PP=64, and DP=8, broken down by execution phase and data type
projects:
  - calculon
pdf: pubs/mikhailisaev_calculon_sc_2023.pdf
slides: pubs/mikhailisaev_calculon_sc_2023_slides.pdf
bibPath: publication/calculon_sc/cite.bib
---
